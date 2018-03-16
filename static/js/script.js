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
    console.log('File(s) uploaded!');

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

    if (languageKeyCount > 0) {
        dropdownContainer.addClass('show');
    } else {
        dropdownContainer.removeClass('show');
    }
});

$('#excel-to-json-submit-button').on('click', function() {
    $('#angular-translation-excel-error').hide();

    var formData = new FormData($('form')[0]);

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                saveByteArray('translations.zip', new Uint8Array(request.response), request.getResponseHeader('content-type'));
            } else if (request.responseText !== '') {
                var errorSpan = $('#angular-translation-excel-error');
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
    request.open('POST', '/api/transform-excel-to-json-files', true);
    request.send(formData);
});

function saveByteArray(filename, data, type) {
    var blob = new Blob([data], { type: type });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}