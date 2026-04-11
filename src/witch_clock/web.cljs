(ns witch-clock.web
  (:require
   [clojure.string :as string]
   [shadow.cljs.modern :refer [defclass]]
   [witch-clock.alchemy :refer [alchemize] :as alchemy]
   [witch-clock.calendar :as calendar]
   [witch-clock.geo :as geo]
   [witch-clock.templates.calendar :as calendar-templates]
   [witch-clock.templates.geo :as geo-templates]
   [witch-clock.templates.layout :as layout-templates]))


(def -geo (atom nil)) ; TODO handle many locations
(def -greg-year (atom nil))
(def -year (atom nil))
(def -date (atom nil))
(def -time (atom nil))
(def -time-timer (atom nil))

(defn setup-geo []
  (-> (geo/recall-current-position)
      (.then (fn [coords] (reset! -geo coords)))
      (.catch #(js/console.log %))))

(defn refresh-clock! [year date time]
  (alchemy/refresh :clock
                   (if year
                     (calendar-templates/current-calendar year date time)
                     [:div])))

(defn refresh-holidays! [year]
  (alchemy/refresh :holidays
                   (if year
                     (calendar-templates/current-holidays year)
                     [:div])))

(defn refresh-geo! [-geo]
  (alchemy/refresh :geo (geo-templates/ask-for-geo -geo)))

(defn refresh-time! [{:keys [time]}]
  (alchemy/refresh :current-time (string/join ":" time)))

(defn track-time! [-geo -year -date -time -time-timer]
  (when @-time-timer
    (swap! -time-timer #(js/clearInterval %)))
  (reset! -time-timer
          (js/setInterval
           (fn []
             (let [now (new js/Date)]
               (cond
                 (calendar/is-before (-> @-year :cycle-end) now)
                 (let [year (.getFullYear now)
                       {:keys [latitude longitude]} @-geo
                       witchy-year (calendar/from-gregorian-year year latitude longitude)]
                   (reset! -year witchy-year))
                 (calendar/is-before (-> @-date :day (nth 2)) now)
                 (reset! -date (calendar/get-day @-year now))
                 :else
                 (reset! -time (calendar/get-current-time @-date)))))
           (* 3 1000))))

(defn update-geo! [-geo -greg-year -year]
  (refresh-geo! -geo)
  (if-let [{:keys [latitude longitude]} @-geo]
    (if (nil? @-greg-year)
      (reset! -greg-year (.getFullYear (new js/Date)))
      (reset! -year (calendar/from-gregorian-year @-greg-year latitude longitude)))
    (do
      (when (some? @-time-timer)
        (swap! -time-timer #(js/clearInterval %)))
      (refresh-clock! nil nil nil)
      (refresh-holidays! nil))))

(defn update-year! [-geo -greg-year]
  (when-let [{:keys [latitude longitude]} @-geo]
    (reset! -year (calendar/from-gregorian-year @-greg-year latitude longitude))))

(defn refresh-year [-year]
  (refresh-holidays! @-year)
  (reset! -date (calendar/get-day @-year)))

(defn refresh-date [-geo -year -date -time -time-timer]
  (let [time (calendar/get-current-time @-date)]
    (refresh-clock! @-year @-date time)
    (track-time! -geo -year -date -time -time-timer)))

(defn main-view [node]
  (add-watch -geo :watch-geo #(update-geo! -geo -greg-year -year))
  (add-watch -greg-year :watch-greg #(update-year! -geo -greg-year))
  (add-watch -year :watch-year #(refresh-year -year))
  (add-watch -date :watch-date #(refresh-date -geo -year -date -time -time-timer))
  (add-watch -time :watch-time #(refresh-time! @-time))
  (.appendChild node (alchemize (layout-templates/container)))
  (setup-geo))

(defclass MainComponent
  (extends js/HTMLElement)
  (constructor [this] (super))
  Object
  (connectedCallback [this] (main-view this)))

(def components
  {:main-component MainComponent})

(def already-defined? "has already been defined as a custom element")
(defn start-app []
  (try
    (doseq [[component-kw component] components]
      (js/customElements.define (name component-kw) component))
    (catch js/Object e
      ;; redefining custom elements is impossible
      ;; so if webcomponents complains about dev trying to do so, reload
      ;; but otherwise, just print the error
      (if (string/ends-with? (ex-message e) already-defined?)
        (js/window.location.reload)
        (js/console.log e)))))
