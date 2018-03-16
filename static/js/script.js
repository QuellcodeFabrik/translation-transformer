var navLinkElements = $('.nav-link');
var tabViewElement = $('.tab-view');

navLinkElements.click(function (element) {
   var id = $(element.target).attr('id');
   var containerId = id.replace('nav-link-', '') + '-files';

    navLinkElements.each(function (index, element) {
       var navElement = $(element);
       if (navElement.attr('id') === id) {
           navElement.addClass('active');
       } else {
           navElement.removeClass('active');
       }
   });

   tabViewElement.each(function (index, element) {
      var containerElement = $(element);
      if (containerElement.attr('id') === containerId) {
          containerElement.removeClass('hidden');
      } else {
          containerElement.addClass('hidden');
      }
   });
});

var jsonFileInput = $('#json-file-input');

jsonFileInput.on('change', function () {
    const fileList = jsonFileInput.prop('files');
    const dropdownContainer = $('#language-selection');
    const dropdown = $('#language-selection-dropdown');
    dropdown.empty();

    var languageKeyCount = 0;
    for (var i=0; i<fileList.length; i++) {
        if (fileList[i].name.substr(-5) === '.json') {
            var languageKey = fileList[i].name.replace('.json', '');
            dropdown.append($('<option value="' + languageKey + '">' + languageKey + '</option>'));
            languageKeyCount++;
        }
    }

    if (languageKeyCount > 1) {
        dropdownContainer.addClass('show');
    } else {
        dropdownContainer.removeClass('show');
    }
});

$('#excel-to-json-submit-button').on('click', function() {
    triggerFileUpload(
        'angular-translation-excel-form',
        'angular-translation-excel-error',
        'translations.zip',
        '/api/transform-excel-to-json-files'
    );
});

$('#json-to-excel-submit-button').on('click', function() {
    triggerFileUpload(
        'angular-translation-json-form',
        'angular-translation-json-error',
        'translations.xlsx',
        '/api/transform-json-files'
    );
});

$('#excel-to-form-configuration-submit-button').on('click', function() {
    triggerFileUpload(
        'form-configuration-excel-form',
        'form-configuration-excel-error',
        'translations.zip',
        '/api/transform-excel-to-form-configuration'
    );
});

$('#form-configuration-to-excel-submit-button').on('click', function() {
    triggerFileUpload(
        'form-configuration-json-form',
        'form-configuration-json-error',
        'translations.xlsx',
        '/api/transform-form-configuration'
    );
});

/**
 * Triggers a file upload for the given form Id and handles the server response
 * accordingly.
 *
 * @param formId
 * @param errorLabelId
 * @param downloadFileName
 * @param apiUrl
 */
function triggerFileUpload(formId, errorLabelId, downloadFileName, apiUrl) {
    $('#' + errorLabelId).hide();

    var formData = new FormData($('#' + formId)[0]);

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                saveByteArray(downloadFileName, new Uint8Array(request.response), request.getResponseHeader('content-type'));
                // remove files from input
                var inputElement = $('#' + formId).find('input[type=file]')[0];
                $(inputElement).val('');
            } else if (request.responseText !== '') {
                var errorSpan = $('#' + errorLabelId);
                errorSpan.text(request.responseText);
                errorSpan.show();
            }
        } else if (request.readyState === 2) {
            // change response type to text in case it is in error state
            if (request.status === 200) {
                request.responseType = 'arraybuffer';
            } else {
                request.responseType = 'text';
            }
        }
    };
    request.open('POST', apiUrl, true);
    request.send(formData);
}

/**
 * Create a temporary download link and trigger it to make the browser offer a
 * download dialogue.
 *
 * @param filename
 * @param data
 * @param type
 */
function saveByteArray(filename, data, type) {
    var blob = new Blob([data], { type: type });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}