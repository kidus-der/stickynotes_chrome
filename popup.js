document.addEventListener('DOMContentLoaded', function() {
  var noteText = document.getElementById('note-text');
  var saveNoteButton = document.getElementById('save-note');

  // load the note for the current tab when the popup is opened
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      var tabId = activeTab.id;

      chrome.storage.sync.get('notes', function(data) {
          var notes = data.notes || {};
          var tabNote = notes[tabId] || '';
          noteText.value = tabNote;
      });
  });

  // save the note when the "Save Note" button is clicked
  saveNoteButton.addEventListener('click', function() {
      var note = noteText.value;

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var activeTab = tabs[0];
          var tabId = activeTab.id;

          chrome.storage.sync.get('notes', function(data) {
              var notes = data.notes || {};
              notes[tabId] = note;
              chrome.storage.sync.set({'notes': notes}, function() {
                  // inject content script to create the icon on the page
                  chrome.scripting.executeScript({
                      target: {tabId: tabId},
                      function: createNoteIcon,
                      args: [note]
                  });

                  // close popup after saving the note
                  window.close();
              });
          });
      });
  });
});

// function to create the note icon
function createNoteIcon(note) {
  var icon = document.createElement('div');
  icon.innerText = '📝';
  icon.style.position = 'fixed';
  icon.style.top = '10px';
  icon.style.right = '10px';
  icon.style.fontSize = '24px';
  icon.style.cursor = 'pointer';
  icon.style.opacity = '0.7';
  icon.style.zIndex = '1000';

  // hover
  icon.addEventListener('mouseenter', function() {
      icon.style.opacity = '1';
  });

  icon.addEventListener('mouseleave', function() {
      icon.style.opacity = '0.7';
  });

  // open edit mode when the icon is clicked
  icon.addEventListener('click', function() {
      openEditMode(note);
  });

  document.body.appendChild(icon);
}

function openEditMode(note) {
  // create modal container
  var modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = '#fff';
  modal.style.padding = '20px';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  modal.style.zIndex = '1001';
  modal.style.width = '300px';

  // create textarea for editing
  var textarea = document.createElement('textarea');
  textarea.style.width = '100%';
  textarea.style.height = '100px';
  textarea.style.padding = '10px';
  textarea.style.borderRadius = '5px';
  textarea.style.border = '1px solid #ccc';
  textarea.value = note;

  // create save button
  var saveButton = document.createElement('button');
  saveButton.innerText = 'Save Note';
  saveButton.style.marginTop = '10px';
  saveButton.style.padding = '10px';
  saveButton.style.width = '100%';
  saveButton.style.backgroundColor = '#6200ea';
  saveButton.style.color = '#fff';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '5px';
  saveButton.style.cursor = 'pointer';
  saveButton.style.fontWeight = 'bold';

  // save button click handler
  saveButton.addEventListener('click', function() {
      var updatedNote = textarea.value;

      // save the updated note
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var activeTab = tabs[0];
          var tabId = activeTab.id;

          chrome.storage.sync.get('notes', function(data) {
              var notes = data.notes || {};
              notes[tabId] = updatedNote;
              chrome.storage.sync.set({'notes': notes}, function() {
                  alert('Note saved!');
                  document.body.removeChild(modal);
              });
          });
      });
  });

  // create the close button
  var closeButton = document.createElement('button');
  closeButton.innerText = 'Close';
  closeButton.style.marginTop = '10px';
  closeButton.style.padding = '10px';
  closeButton.style.width = '100%';
  closeButton.style.backgroundColor = '#f44336';
  closeButton.style.color = '#fff';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '5px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontWeight = 'bold';

  // close button click handler
  closeButton.addEventListener('click', function() {
      document.body.removeChild(modal);
  });

  // append the textarea, save button, and close button to modal
  modal.appendChild(textarea);
  modal.appendChild(saveButton);
  modal.appendChild(closeButton);

  document.body.appendChild(modal);
}
