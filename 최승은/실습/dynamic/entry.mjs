console.log('🟢 Start App');

if (Math.random() > 0.5) {
  const mod = await import('./lazy-module.mjs');
  await mod.delay(1000);
  mod.greet();
} else {
  console.log('⛔ Skip lazy load');
}