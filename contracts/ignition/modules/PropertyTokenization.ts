import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PropertyTokenizationModule = buildModule(
  "PropertyTokenizationModule",
  (m) => {
    const propertyTokenization = m.contract("PropertyTokenization");

    return { propertyTokenization };
  }
);

export default PropertyTokenizationModule;
