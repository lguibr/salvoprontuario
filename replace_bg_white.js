import fs from 'fs';
const files = [
  'src/App.tsx',
  'src/components/Sidebar.tsx',
  'src/components/PatientPreviewModal.tsx',
  'src/components/SessionGenerator.tsx',
  'src/components/PatientRegistrationModal.tsx',
  'src/components/PatientHeader.tsx',
  'src/components/PatientSettingsModal.tsx',
  'src/components/SessionCard.tsx',
  'src/components/PatientChat.tsx',
  'src/components/PatientGlobalData.tsx',
  'src/components/MaskedDateInput.tsx',
  'src/components/PatientView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/(?<!print:)bg-white(?=[\s"'}])/g, 'bg-nt-paper');
    fs.writeFileSync(file, content);
  }
});
console.log("Done");
