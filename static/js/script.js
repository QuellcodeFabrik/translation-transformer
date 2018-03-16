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