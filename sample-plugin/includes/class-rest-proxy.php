<?php
/**
 * REST API Proxy for Frappe CRM.
 *
 * Prevents browser CORS restrictions when running inside WordPress admin or WordPress Playground
 * by relaying requests from the frontend datastore to the Frappe server using wp_remote_request().
 *
 * @package WP_Frappe_Data_Store_Sample
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_Frappe_Data_Store_REST_Proxy {

	/**
	 * Namespace for REST routes.
	 *
	 * @var string
	 */
	const NAMESPACE = 'frappe-data-store/v1';

	/**
	 * Register REST routes.
	 */
	public function register_routes() {
		// Settings endpoint to get/set default fallback URL and credentials.
		register_rest_route(
			self::NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);

		// Proxy endpoint matching any path after /proxy/.
		register_rest_route(
			self::NAMESPACE,
			'/proxy/(?P<path>.*)',
			array(
				array(
					'methods'             => WP_REST_Server::ALLMETHODS,
					'callback'            => array( $this, 'handle_proxy' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
	}

	/**
	 * Check if current user has permission to manage options.
	 *
	 * @return bool
	 */
	public function check_permission() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get saved connection settings.
	 *
	 * @return WP_REST_Response
	 */
	public function get_settings() {
		return new WP_REST_Response(
			array(
				'siteUrl' => get_option( 'frappe_sample_site_url', 'https://frappe.localhost' ),
				'hasToken' => ! empty( get_option( 'frappe_sample_api_token', '' ) ),
			),
			200
		);
	}

	/**
	 * Save connection settings.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function save_settings( $request ) {
		$params = $request->get_json_params();
		if ( isset( $params['siteUrl'] ) ) {
			update_option( 'frappe_sample_site_url', esc_url_raw( trim( $params['siteUrl'] ) ) );
		}
		if ( isset( $params['apiToken'] ) ) {
			update_option( 'frappe_sample_api_token', sanitize_text_field( trim( $params['apiToken'] ) ) );
		}
		if ( ! empty( $params['clearToken'] ) ) {
			delete_option( 'frappe_sample_api_token' );
		}
		return $this->get_settings();
	}

	/**
	 * Proxy requests to Frappe CRM.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function handle_proxy( $request ) {
		$target_path = '/' . ltrim( $request['path'], '/' );
		$query_params = $request->get_query_params();
		unset( $query_params['rest_route'] );

		if ( ! empty( $query_params ) ) {
			$target_path .= '?' . http_build_query( $query_params );
		}

		$site_url = $request->get_header( 'x_frappe_site_url' );
		if ( empty( $site_url ) ) {
			$site_url = get_option( 'frappe_sample_site_url', 'https://frappe.localhost' );
		}
		$site_url = rtrim( $site_url, '/' );

		$url = $site_url . $target_path;

		$headers = array(
			'Accept' => 'application/json',
		);

		$auth_header = $request->get_header( 'authorization' );
		if ( empty( $auth_header ) ) {
			$api_token = get_option( 'frappe_sample_api_token', '' );
			if ( ! empty( $api_token ) ) {
				$auth_header = 'token ' . $api_token;
			}
		}

		if ( ! empty( $auth_header ) ) {
			$headers['Authorization'] = $auth_header;
		}

		$method = $request->get_method();
		$args   = array(
			'method'    => $method,
			'headers'   => $headers,
			'timeout'   => 15,
			'sslverify' => false, // For local dev/self-signed certs.
		);

		if ( in_array( $method, array( 'POST', 'PUT', 'PATCH', 'DELETE' ), true ) ) {
			$body = $request->get_body();
			if ( ! empty( $body ) ) {
				$args['body'] = $body;
				$args['headers']['Content-Type'] = $request->get_header( 'content_type' ) ?: 'application/json';
			} elseif ( ! empty( $request->get_params() ) && 'POST' === $method ) {
				// Handle form-urlencoded login requests.
				$args['body'] = http_build_query( $request->get_body_params() );
				$args['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
			}
		}

		// Forward cookies if present (for password session login).
		$cookie_header = $request->get_header( 'cookie' );
		if ( ! empty( $cookie_header ) ) {
			$args['headers']['Cookie'] = $cookie_header;
		}

		$response = wp_remote_request( $url, $args );

		if ( is_wp_error( $response ) ) {
			return new WP_Error(
				'frappe_proxy_error',
				sprintf( 'Could not reach %s: %s', $site_url, $response->get_error_message() ),
				array( 'status' => 502 )
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$body_str    = wp_remote_retrieve_body( $response );
		$data        = json_decode( $body_str, true );

		if ( null === $data && ! empty( $body_str ) ) {
			$data = array( 'message' => $body_str );
		}

		$rest_response = new WP_REST_Response( $data ?: new stdClass(), $status_code );

		// Forward Set-Cookie headers back to browser if returned by Frappe login.
		$cookies = wp_remote_retrieve_header( $response, 'set-cookie' );
		if ( ! empty( $cookies ) ) {
			if ( is_array( $cookies ) ) {
				foreach ( $cookies as $cookie ) {
					header( 'Set-Cookie: ' . $cookie, false );
				}
			} else {
				header( 'Set-Cookie: ' . $cookies, false );
			}
		}

		return $rest_response;
	}
}
