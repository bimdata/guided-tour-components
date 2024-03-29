<template>
  <div
    ref="guidedTourPortal"
    class="guided-tour-portal"
    :class="{ centeredTooltip }"
    :style="`z-index: ${zIndex}`"
    v-show="showGuidedTour"
  >
    <div
      v-if="currentStep"
      ref="tooltip"
      class="tooltip"
      :style="{
        opacity: showTooltip ? 1 : 0,
        transition: `opacity ${transitionDuration}s ease-in-out`,
      }"
    >
      <div
        ref="arrow"
        class="arrow"
      ></div>
      <div class="tooltip__box">
        <div class="tooltip__box__top">
          <div
            class="tooltip__box__top__image"
            :style="{
                background: `var(--platform-background) url(${currentStep.props.img}) no-repeat ${currentStep.props.imgPosition} / ${currentStep.props.imgSize}`,
              }"
          />
        </div>
        <div class="tooltip__box__progress-bar">
          <div
            class="tooltip__progress-bar__step"
            v-for="(step, index) of steps"
            :key="index"
            :style="{
            width: `calc(100% / ${steps.length})`,
            backgroundColor:
              steps.indexOf(currentStep) >= index
                ? 'var(--color-secondary)'
                : '',
          }"
          ></div>
        </div>
        <div class="tooltip__box__bottom">
          <div class="tooltip__box__bottom__title">
            {{ currentStep.props.title }}
          </div>
          <div class="tooltip__box__bottom__text">
            {{ currentStep.props.content }}
          </div>
        </div>
        <div class="tooltip__box__footer">
          <div class="tooltip__box__footer__step-counter">
            <span>{{ stepIndex + 1 }}</span>
            <span>/{{ steps.length }}</span>
          </div>
          <template v-if="!isStepOutro">
            <div class="tooltip__box__footer__btn-skip">
              <BIMDataButton
                width="0px"
                height="0px"
                color="granite"
                @click="close"
              >
                {{ translate("skip") }}
              </BIMDataButton>
            </div>
          </template>
          <template v-else>
            <div class="tooltip__box__footer__ghost-element"></div>
          </template>
          <template v-if="isStepOutro">
            <div class="tooltip__box__footer__btn-start">
              <BIMDataButton
                width="0px"
                height="0px"
                color="granite"
                @click="close"
              >
                {{ translate("continue") }}
              </BIMDataButton>
            </div>
          </template>
          <template v-else>
            <div class="tooltip__box__footer__btn-next">
              <BIMDataButton
                width="0px"
                height="0px"
                color="primary"
                fill
                radius
                @click="clickNext"
              >
                <span> {{translate("next")}}</span>
                <BIMDataIconChevron
                  size="xxs"
                  fill
                  color="white"
                />
              </BIMDataButton>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { scrollToTarget, setTooltipPosition } from "./guided-tour-utils.js";

import trads from "./i18n.js";

import BIMDataButton from "@bimdata/design-system/src/BIMDataComponents/BIMDataButton/BIMDataButton.vue";
import BIMDataIconChevron from "@bimdata/design-system/src/BIMDataComponents/BIMDataIcon/BIMDataIconStandalone/BIMDataIconChevron.vue";

export default {
  components: {
    BIMDataButton,
    BIMDataIconChevron,
  },
  props: {
    locale: {
      type: String,
      default: "en",
    },
    tours: {
      type: Array,
      default: () => [],
    },
    tourToDisplay: {
      type: String,
      default: () => "",
    },
    elementToObserve: {
      type: [Object, HTMLElement],
      default: () => {},
    },
    zIndex: {
      type: Number,
      default: () => 10000,
    },
    transitionDuration: {
      type: Number,
      default: () => 0.3,
    },
  },
  emits: ["set-completed-tour"],
  data() {
    return {
      steps: [],
      showGuidedTour: false,
      currentTarget: null,
      showTooltip: false,
      stepIndex: 0,
    };
  },
  computed: {
    currentStep() {
      return this.steps[this.stepIndex];
    },
    nextStep() {
      return this.steps[this.stepIndex + 1];
    },
    centeredTooltip() {
      return this.currentStep && !this.currentStep.target;
    },
    isStepIntro() {
      return this.stepIndex === 0;
    },
    isStepOutro() {
      return this.stepIndex === this.steps.length - 1;
    },
  },
  watch: {
    steps() {
      this.stepIndex = 0;
    },
    async currentStep(step) {
      try {
        if (!step) return;
        this.currentTarget = null;

        if (step.target) {
          this.currentTarget = this.getDomElements(step);
        } else {
          // display a centered tooltip
          this.showTooltip = true;
          return;
        }

        step.action?.(
          this.currentTarget.element.getAttribute("data-guide-param")
        );

        if (step.clickable) {
          this.clickListener();
        }

        scrollToTarget(this.currentTarget.element, this.elementToObserve);
        setTooltipPosition(
          this.currentTarget.element,
          this.$refs.tooltip,
          this.$refs.arrow,
          step.yOffset,
          step.xOffset
        );

        this.showTooltip = true;
      } catch {
        this.closeGuidedTour();
      }
    },
  },
  created() {
    this.mutationObserver = new MutationObserver(this.handleClickedStep);
  },
  mounted() {
    const tour = this.tours.find((t) => t.name === this.tourToDisplay);
    if (tour) {
      this.openGuidedTour(tour.steps);
    } else {
      console.warn(`GuideTour: unknown tour ${this.tourToDisplay}`);
    }
  },
  unmounted() {
    this.mutationObserver.disconnect();
  },
  destroyed() {
    this.mutationObserver.disconnect();
  },
  methods: {
    clickNext() {
      this.resetSettings();
      setTimeout(() => {
        if (this.currentStep.clickable) {
          (
            this.currentTarget.elementToClick || this.currentTarget.element
          ).click();
        } else {
          this.next();
        }
      }, this.transitionDuration * 1000);
    },
    openGuidedTour(arg) {
      this.steps = arg.map((step) => {
        return {
          ...step,
          layout: step.layout ? Object.freeze(step.layout) : null,
        };
      });
      this.showGuidedTour = true;
    },
    getDomElements(step, elementToWatch = document) {
      const { target, targetDetail, targetToClick, targetToClickDetail } = step;

      let element, elementToClick;

      if (Array.isArray(target)) {
        element = target.map((t) =>
          elementToWatch.querySelector(`[data-guide=${t}]`)
        );
      } else if (typeof target === "string") {
        element = elementToWatch.querySelector(
          `[data-guide=${target}] ${targetDetail ? targetDetail : ""}`
        );
      }

      if (targetToClick) {
        elementToClick = elementToWatch.querySelector(
          `[data-guide-click=${targetToClick}] ${
            targetToClickDetail ? targetToClickDetail : ""
          }`
        );
      }

      return {
        element,
        elementToClick,
      };
    },
    closeGuidedTour() {
      this.showGuidedTour = false;
      this.steps = [];
    },
    next() {
      this.stepIndex++;
    },
    close() {
      this.showTooltip = false;
      this.closeGuidedTour();
      this.$emit("set-completed-tour", this.tourToDisplay);
    },
    resetSettings() {
      this.showTooltip = false;
    },
    clickListener() {
      (
        this.currentTarget.elementToClick || this.currentTarget.element
      ).addEventListener(
        "click",
        () => {
          if (this.nextStep.target) {
            this.mutationObserver.observe(this.elementToObserve, {
              childList: true,
              subtree: true,
            });
          } else {
            this.next();
          }
        },
        { once: true }
      );
    },
    handleClickedStep() {
      const { element } = this.getDomElements(
        this.nextStep,
        this.elementToObserve
      );

      const isAnHTMLElement = element instanceof HTMLElement;
      const isAnArrayOfHTMLElement =
        Array.isArray(element) &&
        element.every((elem) => elem instanceof HTMLElement);

      if (isAnHTMLElement || isAnArrayOfHTMLElement) {
        this.next();
        this.mutationObserver.disconnect();
      }
    },
    translate(key) {
      return (trads[this.locale] || trads["en"])[key];
    },
  },
};
</script>

<style scoped lang="scss" src="./_BIMDataGuidedTour.scss"></style>
