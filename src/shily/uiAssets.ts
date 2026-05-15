const generatedBase = '/assets/generated'
const shilyBase = '/assets/shily'

export const uiAssets = {
  shily: {
    main: `${generatedBase}/shily-main.png`,
    heart: `${generatedBase}/shily-heart.png`,
    leaf: `${generatedBase}/shily-leaf.png`,
    state: {
      normal: `${shilyBase}/normal.png`,
      happy: `${shilyBase}/happy.png`,
      tired: `${shilyBase}/tired.png`,
      lowEnergy: `${shilyBase}/low-energy.png`,
      puffy: `${shilyBase}/puffy.png`,
      stressed: `${shilyBase}/stressed.png`,
    },
  },
  feature: {
    meal: `${generatedBase}/feature-meal.png`,
    takeout: `${generatedBase}/feature-takeout.png`,
    water: `${generatedBase}/feature-water.png`,
    window: `${generatedBase}/feature-window.png`,
    nutrition: `${generatedBase}/feature-nutrition.png`,
    record: `${generatedBase}/feature-record.png`,
    plan: `${generatedBase}/feature-plan.png`,
    stage: `${generatedBase}/feature-stage.png`,
    help: `${generatedBase}/feature-help.png`,
    mood: `${generatedBase}/feature-mood.png`,
    movement: `${generatedBase}/feature-movement.png`,
  },
  plan: {
    gentle: `${generatedBase}/feature-plan.png`,
    fasting: `${generatedBase}/feature-window.png`,
    carb: `${generatedBase}/plan-carb.png`,
    glp1: `${generatedBase}/plan-glp1.png`,
  },
} as const

export type UiAssets = typeof uiAssets
