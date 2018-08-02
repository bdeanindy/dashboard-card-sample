$(document).ready(function() {
    console.log('jQuery should be loaded now...');

    /*** Handle Editor/Publish Buttons to Weebly ***/
    /*
    var $editorButton = $('#editorButton');
    var $publishButton = $('#publishButton');

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

    var receiveMessage = (evt) => {
        if( event.origin !== 'https://www.weebly.com') return;
        console.log( 'Origin: ', evt.origin ); // Origin of the window that sent the message at the time `postMessage` was called.
        console.log( 'Data: ', evt.data ); // The object passed from the other window
        console.log( 'Source: ', evt.source ); // A reference to the window object that sent the message, use this to establish two-way communication cross-origin
    };
    */

    // LOADING ICON SHOWN BY DEFAULT, `appData` HIDDEN BY DEFAULT

    // Handle proxying the bump in DBCard Counter
    var $configureBtn = $('button#configureCard');

    $configureBtn.on('click', function(evt) {
        // TODO Hide/Show as appropriate
        var $appData        = $('#appData');
        var loadingIcon     = $('#loading');
        var $siteId         = $('#configureCard').data('siteId');
        var $userId         = $('#configureCard').data('userId');

        var jqxhr = $.post('/cards/configure/helloworld', {site_id: $siteId, user_id: $userId}, function(response) {
            console.log(response);
        }, "json")
        .done(function(data) {
            console.log('Done processing the AJAX request to configure the Dashboard Card:', data);
        })
        .fail(function(err) {
            console.log(err);
            // TODO: Update the UI to inform the user there was a problem trying to configure the dashboard card
        });
    });

});
