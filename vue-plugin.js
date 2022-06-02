import { BIMDataGuidedTour } from "./dist/guided-tour-components.es.js";

const pluginFactory = () => {
  return {
    install(app) {
      app.component("BIMDataGuidedTour", BIMDataGuidedTour);
    },
  };
};

export default pluginFactory;
