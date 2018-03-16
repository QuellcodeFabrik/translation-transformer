$('.nav-link').click((element) => {
   const id = $(element.target).attr('id');
   const containerId = id.replace('nav-link-', '') + '-files';

   $('.nav-link').each((index, element) => {
       const navElement = $(element);
       if (navElement.attr('id') === id) {
           navElement.addClass('active');
       } else {
           navElement.removeClass('active');
       }
   });

   $('.tab-view').each((index, element) => {
      const containerElement = $(element);
      if (containerElement.attr('id') === containerId) {
          containerElement.removeClass('hidden');
      } else {
          containerElement.addClass('hidden');
      }
   });
});

$('#excel-file-input').on('change', () => {
    console.log('File(s) uploaded!');

    const fileList = $('#excel-file-input').prop('files');
    const dropdownContainer = $('#language-selection');
    const dropdown = $('#language-selection-dropdown');
    dropdown.empty();

    let languageKeyCount = 0;
    for (let i=0; i<fileList.length; i++) {
        if (fileList[i].name.substr(-5) === '.json') {
            const languageKey = fileList[i].name.replace('.json', '');
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