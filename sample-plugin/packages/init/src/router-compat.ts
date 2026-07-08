/**
 * View Transition API Compatibility Wrapper for @wordpress/router.
 *
 * When navigating rapidly between routes or during overlapping state updates,
 * the browser's View Transition API skips pending transitions and rejects both
 * transition.ready and transition.finished promises with an AbortError:
 * "Transition was skipped".
 *
 * Because current versions of @wordpress/router do not attach .catch() handlers
 * to the promises returned by document.startViewTransition(), the browser logs
 * unhandled promise rejection console errors.
 *
 * This wrapper attaches a no-op .catch() handler to transition promises
 * immediately upon creation, cleanly preventing console noise without altering
 * transition behavior or routing logic.
 */
if ( typeof document !== 'undefined' && document.startViewTransition ) {
	const originalStartViewTransition =
		document.startViewTransition.bind( document );
	document.startViewTransition = ( callback?: ViewTransitionCallback ) => {
		const transition = originalStartViewTransition( callback );
		if ( transition && transition.finished ) {
			transition.finished.catch( () => {} );
		}
		if ( transition && transition.ready ) {
			transition.ready.catch( () => {} );
		}
		return transition;
	};
}
