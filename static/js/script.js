//
// Configuration
//
var configuration = {
  java: {
      fileInputFieldId: '#java-property-file-input',
      languageMappingContainerId: '#java-property-file-mapper',
      baseLanguageDropDownId: '#java-property-file-language-selection-dropdown',
      baseLanguageDropDownContainerId: '#java-property-file-language-selection',
      languageSelectionErrorLabel: '#java-property-file-language-selection-error',
      fileNameToLanguageMapping: {}
  },
  form: {
    fileInputFieldId: '#form-configuration-file-input',
    languageMappingContainerId: '#form-configuration-file-mapper',
    baseLanguageDropDownId: '#form-configuration-language-selection-dropdown',
    baseLanguageDropDownContainerId: '#form-configuration-language-selection',
    languageSelectionErrorLabel: '#form-configuration-language-selection-error',
    fileNameToLanguageMapping: {}
  }
};

//
// Navigation functionality
//

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

//
// JSON translation file input
//

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
        '/api/transform-json-files-to-excel'
    );
});

//
// Java property file input handling
//

$(configuration.java.fileInputFieldId).on('change', function () {
    console.log('Java properties file input changed');
    handleFileInputChange('java', $(this).prop('files'), '.properties');
});

$('#java-property-to-excel-submit-button').on('click', function() {
    function isFormComplete() {
        var isValid = true;
        $('.java-file-form-field').each(function() {
            if ( $(this).val() === '' )
                isValid = false;
        });
        return isValid;
    }

    if (!isFormComplete()) {
        $(configuration.java.languageSelectionErrorLabel).show();
        return;
    }

    triggerFileUpload(
        'java-property-file-form',
        'java-property-file-error',
        'translations.xlsx',
        '/api/transform-java-property-files-to-excel',
        'java'
    );
});

$('#excel-to-property-file-submit-button').on('click', function() {
    triggerFileUpload(
        'java-property-excel-form',
        'java-property-excel-error',
        'translations.zip',
        '/api/transform-excel-to-java-property-files'
    );
});

//
// Form configuration input handling
//

$(configuration.form.fileInputFieldId).on('change', function () {
    console.log('Form configuration file input changed');
    handleFileInputChange('form', $(this).prop('files'), '.json');
});

$('#form-configuration-to-excel-submit-button').on('click', function() {
    function isFormComplete() {
        var isValid = true;
        $('.form-file-form-field').each(function() {
            if ( $(this).val() === '' )
                isValid = false;
        });
        return isValid;
    }

    if (!isFormComplete()) {
        $(configuration.form.languageSelectionErrorLabel).show();
        return;
    }

    triggerFileUpload(
        'form-configuration-json-form',
        'form-configuration-json-error',
        'translations.xlsx',
        '/api/transform-form-configurations-to-excel',
        'form'
    );
});

$('#excel-to-form-configuration-submit-button').on('click', function() {
    triggerFileUpload(
        'form-configuration-excel-form',
        'form-configuration-excel-error',
        'translations.zip',
        '/api/transform-excel-to-form-configurations'
    );
});

//
// Helper functions
//

/**
 * Triggers a file upload for the given form Id and handles the server response
 * accordingly.
 *
 * @param formId
 * @param errorLabelId
 * @param downloadFileName
 * @param apiUrl
 * @param fileType as defined in the configuration section
 */
function triggerFileUpload(formId, errorLabelId, downloadFileName, apiUrl, fileType) {
    $('#' + errorLabelId).hide();

    var formData = new FormData($('#' + formId)[0]);

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                saveByteArray(downloadFileName, new Uint8Array(request.response), request.getResponseHeader('content-type'));
                cleanUpUserInput(formId, fileType);
            } else if (request.responseText !== '') {
                var errorSpan = $('#' + errorLabelId);
                errorSpan.text(request.responseText);
                errorSpan.show().css('display', 'block');
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
 * Clean up all user input.
 *
 * @param formId
 * @param fileType as defined in the configuration section
 */
function cleanUpUserInput(formId, fileType) {
    // handleFileInputChange
    var inputElement = $('#' + formId).find('input[type=file]')[0];
    $(inputElement).val('');

    // clean all input elements
    // $('#' + formId).find('input').each(function() {
    //     $(this).val('');
    // });

    if (!fileType || !configuration[fileType]) {
        console.warn(`File type ${fileType} does not exist.`);
        return;
    }

    const mappingContainer = $(configuration[fileType].languageMappingContainerId);
    mappingContainer.empty();
    mappingContainer.removeClass('show');

    const dropdown = $(configuration[fileType].baseLanguageDropDownId);
    dropdown.empty();

    const dropdownContainer = $(configuration[fileType].baseLanguageDropDownContainerId);
    dropdownContainer.removeClass('show');
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

/**
 * Handler for all file inputs that require a file name - language mapping.
 *
 * @param fileType as defined in the configuration section
 * @param fileList the list of files currently selected
 * @param fileExtension can be json or properties
 */
function handleFileInputChange(fileType, fileList, fileExtension) {
    console.log(fileExtension + ' files selected');

    // clean up data from last file selection
    configuration[fileType].fileNameToLanguageMapping = {};

    const dropdown = $(configuration[fileType].baseLanguageDropDownId);
    dropdown.empty();

    const mappingContainer = $(configuration[fileType].languageMappingContainerId);

    mappingContainer.append($('<table>'));

    for (var i=0; i<fileList.length; i++) {
        if (fileList[i].name.substr(-fileExtension.length) === fileExtension) {
            mappingContainer.append(
                $('<tr>' +
                    '<td><label>' + fileList[i].name + ':</label></td>' +
                    '<td><input ' +
                    'type="text" ' +
                    'name="file:' + fileList[i].name + '" ' +
                    'class="' + fileType + '-file-form-field" ' +
                    'onchange="updateLanguageDropDown(event, \'' + fileType + '\')" ' +
                    'required /></td>' +
                    '</tr>'
                )
            );
        }
    }

    mappingContainer.append($('</table>'));

    if (fileList.length) {
        mappingContainer.addClass('show');
    } else {
        configuration[fileType].fileNameToLanguageMapping = {};
        mappingContainer.empty();
        mappingContainer.removeClass('show');
    }

    const dropdownContainer = $(configuration[fileType].baseLanguageDropDownContainerId);

    if (fileList.length > 1) {
        dropdownContainer.addClass('show');
    } else {
        dropdownContainer.removeClass('show');
    }
}

/**
 * Handler that is being triggered when a new file name - language mapping is
 * added. Uses the configuration data structure to find the right elements.
 *
 * @param event
 * @param fileType as defined in the configuration section
 */
function updateLanguageDropDown(event, fileType) {
    console.log('Update base language selection drop down for file type:', fileType);

    $(configuration[fileType].languageSelectionErrorLabel).hide();
    var mapping = configuration[fileType].fileNameToLanguageMapping;

    if (event.target.value) {
        mapping[event.target.name] = event.target.value;
    } else if (mapping.hasOwnProperty(event.target.name)) {
        delete mapping[event.target.name];
    }

    const dropdown = $(configuration[fileType].baseLanguageDropDownId);
    dropdown.empty();

    Object.keys(mapping).forEach(function (fileName) {
        const languageKey = mapping[fileName];
        dropdown.append($('<option value="' + languageKey + '">' + languageKey + '</option>'));
    });
}
