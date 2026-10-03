export const authAppearance = {
  variables: {
    colorPrimary: '#5a8dee',
    colorText: '#f5f8ff',
    colorTextSecondary: '#b5c2dc',
    colorBackground: '#121d36',
    colorInputBackground: '#101a32',
    colorInputText: '#f5f8ff',
    borderRadius: '10px',
    fontFamily: "'Inter', Arial, Helvetica, sans-serif",
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: { width: '100%', boxShadow: 'none' },
    card: { width: '100%', backgroundColor: 'transparent', boxShadow: 'none', padding: 0 },
    headerTitle: { color: '#f5f8ff', fontSize: '1.5rem', fontWeight: 800 },
    headerSubtitle: { color: '#b5c2dc' },
    formFieldLabel: { color: '#f5f8ff', fontWeight: 600 },
    formFieldInput: { backgroundColor: '#101a32', borderColor: 'rgba(161, 184, 225, .42)', color: '#f5f8ff' },
    formButtonPrimary: { backgroundColor: '#5a8dee', color: '#06242b', fontWeight: 800, boxShadow: 'none' },
    socialButtonsBlockButton: { backgroundColor: 'rgba(255, 255, 255, .06)', borderColor: 'rgba(255, 255, 255, .15)', color: '#f5f8ff' },
    footerActionLink: { color: '#8ab4ff' },
  },
};
