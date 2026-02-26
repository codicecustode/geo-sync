const providerModules = import.meta.glob("./*/index.jsx", { eager: true });

const providers = Object.values(providerModules).reduce((acc, module) => {
  if (module.providerKey && module.default) {
    acc[module.providerKey] = module.default;
  }
  return acc;
}, {});

export function getMapProvider(providerName) {
  return providers[providerName] || providers.leaflet;
}
