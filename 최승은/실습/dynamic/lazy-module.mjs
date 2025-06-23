export const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const greet = () => console.log('👋 Hello from lazy module');
