export const authAppearance = {
  variables: {
    colorPrimary: '#5eead4',
    colorText: '#f5f8fb',
    colorTextSecondary: '#bdccdb',
    colorBackground: '#1b2638',
    colorInputBackground: '#131e2d',
    colorInputText: '#f5f8fb',
    borderRadius: '10px',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: { width: '100%', boxShadow: 'none' },
    card: { width: '100%', backgroundColor: 'transparent', boxShadow: 'none', padding: 0 },
    headerTitle: { color: '#f5f8fb', fontSize: '1.5rem', fontWeight: 800 },
    headerSubtitle: { color: '#bdccdb' },
    formFieldLabel: { color: '#f5f8fb', fontWeight: 600 },
    formFieldInput: { backgroundColor: '#131e2d', borderColor: '#576b7e', color: '#f5f8fb' },
    formButtonPrimary: { backgroundColor: '#5eead4', color: '#06242b', fontWeight: 800, boxShadow: 'none' },
    socialButtonsBlockButton: { backgroundColor: '#223249', borderColor: '#527c81', color: '#f5f8fb' },
    footerActionLink: { color: '#5eead4' },
  },
};
