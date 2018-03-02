$(function() {
    console.log('jQuery should be loaded now...');

    /*** Custom Client-Side Code ***/

    let $editorButton = $('#editorButton');
    let $publishButton = $('#publishButton');

    if( $editorButton ) {
        $editorButton.on('click', function(evt) {
            console.log('editor button clicked:', evt);
            window.parent.postMessage('editor', 'https://www.weebly.com');
        });
    }

    if( $publishButton ) {
        $publishButton.on('click', function(evt) {
            console.log('publish button clicked:', evt);
            window.parent.postMessage('publish', 'https://www.weebly.com');
        });
    }

    window.addEventListener('message', receiveMessage, false);

    let receiveMessage = (evt) => {
        if( event.origin !== 'https://www.weebly.com') return;
        console.log( 'Origin: ', evt.origin ); // Origin of the window that sent the message at the time `postMessage` was called.
        console.log( 'Data: ', evt.data ); // The object passed from the other window
        console.log( 'Source: ', evt.source ); // A reference to the window object that sent the message, use this to establish two-way communication cross-origin
    };

});
