// Used for a unique technology that generates electricity
class GenerationSource {
    constructor(name, averageGridIntensityTonnesCo2PerKwh) {
        // Human readable name
        this.name = name;
        // When this tech runs, how much CO2 does it emit per kWh generated
        this.averageGridIntensityTonnesCo2PerKwh = averageGridIntensityTonnesCo2PerKwh;
    }
}

// Some typical generating sources and their grid intensities
const CoalGeneration = new GenerationSource('Coal', 0.000915);
const NaturalGasGeneration = new GenerationSource('Natural Gas', 0.000549);
const CombinedCycleNaturalGasGeneration = new GenerationSource('Combined Cycle Natural Gas', 0.000436);
const NuclearGeneration = new GenerationSource('Nuclear', 0.0000);
const SolarGeneration = new GenerationSource('Solar', 0.0000);
const WindGeneration = new GenerationSource('Wind', 0.0000);
const HydropowerGeneration = new GenerationSource('Hydropower', 0.0000);

// This class tracks how much of a generating source is called upon in a Balancing Authority
// A Balancing Authority is a independent market of the grid responsible for matching supply with demand
class BAGenerationMix {
    constructor(generationSource, averageGridContribution) {
        // For a particular GenerationSource 
        this.generationSource = generationSource;
        // What % of the energy in this section of the grid comes from this generating source
        this.averageGridContribution = averageGridContribution;
    }
}

// An example mix of Generating Sources for the CAISO Balancing Authority
const CAISONaturalGasMix = new BAGenerationMix(NaturalGasGeneration, 0.44)
const CAISOHydropowerMix = new BAGenerationMix(HydropowerGeneration, 0.12)
const CAISOSolarMix = new BAGenerationMix(SolarGeneration, 0.26)
const CAISONuclearMix = new BAGenerationMix(NuclearGeneration, 0.7)
const CAISOWindMix = new BAGenerationMix(WindGeneration, 0.11)

// Grid Intensity Data represents all the data you need about a Balancing Authority to populate the UI
class GridIntensityData {
    constructor(baName, baGenerationMixes, averageTonnesCo2PerKwH) {
        // The name of the Balancing Authority (although I don't think we use this)
        this.baName = baName
        // An array of Generation Mixes present throughout the year
        this.baGenerationMixes = baGenerationMixes;
        // The average tonnes of CO2 emitted per kWh for the year based on the mix if GenerationSources
        // Note that this is actually pretty complicated to figure out but we'll just hardcode an estimate for the hackathon
        this.averageTonnesCo2PerKwH = averageTonnesCo2PerKwH;
    }
}

// Wrap up all the grid intensity data for one Balancing Authority (CAISO)
const CAISOGridIntensityData = new GridIntensityData('CAISO', [CAISONaturalGasMix, CAISOHydropowerMix, CAISOSolarMix, CAISONuclearMix, CAISOWindMix], 0.000436)

// Map that links utilities that we support for Utility Connect to particular Balancing Authorities
// For now, we only have CAISO.
export const balancingAuthorityIdForUtilityName = {
    // CAISO
    'PG&E': 1,
    'SCE': 1,
    'PG&E': 1,
}

// Map that links the Balancing Authority ID with the wrapped up package of all the carbon intensity data
export const gridIntensityDataForBalancingAuthorityId = {
    1: CAISOGridIntensityData,
}