"use strict";

/**
 * @typedef {"marketing" | "management" | "hr" | "design" | "development"} CourseCategory
 */

/**
 * Сырые данные курса из courses.json
 * @typedef {Object} CourseData
 * @property {number} id
 * @property {string} title
 * @property {CourseCategory} category
 * @property {string} categoryLabel
 * @property {number} price
 * @property {string} speaker
 * @property {string} image — имя файла, без пути
 */

const COURSE_CATEGORY_MODIFIERS = {
  marketing: "marketing",
  management: "management",
  hr: "hr",
  design: "design",
  development: "development",
};

class Course {
  static IMAGE_PATH = "img/cource/";

  /**
   * @param {CourseData} data
   */
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.category = data.category;
    this.categoryLabel = data.categoryLabel;
    this.price = data.price;
    this.speaker = data.speaker;
    this.image = data.image;
  }

  /**
   * @param {CourseData} data
   * @returns {Course}
   */
  static fromJSON(data) {
    return new Course(data);
  }

  /**
   * @param {CourseData[]} list
   * @returns {Course[]}
   */
  static listFromJSON(list) {
    return list.map(function (item) {
      return Course.fromJSON(item);
    });
  }

  /** @returns {string} */
  get imageUrl() {
    return Course.IMAGE_PATH + this.image;
  }

  /** @returns {string} */
  get categoryModifier() {
    return COURSE_CATEGORY_MODIFIERS[this.category] || this.category;
  }

  /** @returns {string} */
  get formattedPrice() {
    return "$" + this.price;
  }

  /** @returns {string} */
  get formattedSpeaker() {
    return "by " + this.speaker;
  }
}
