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
      (.catch #(js/console.log "No saved geo position."))))

(defn refresh-geo []
  (alchemy/refresh :geo (geo-templates/ask-for-geo -geo))
  (if-let [{:keys [latitude longitude]} @-geo]
    (if (nil? @-greg-year)
      (reset! -greg-year (.getFullYear (new js/Date)))
      (reset! -year (calendar/from-gregorian-year @-greg-year latitude longitude)))
    (do
      (when (some? @-time-timer)
        (swap! -time-timer #(js/clearInterval %)))
      (alchemy/refresh :clock [:div])
      (alchemy/refresh :holidays [:div]))))

(defn reset-greg-year []
  (when-let [{:keys [latitude longitude]} @-geo]
    (reset! -year (calendar/from-gregorian-year @-greg-year latitude longitude))))

(defn refresh-year []
  (alchemy/refresh :holidays (calendar-templates/current-holidays @-year))
  (reset! -date (calendar/get-day @-year)))

(defn refresh-date []
  (let [time (calendar/get-current-time @-date)]
    (alchemy/refresh :clock (calendar-templates/calendar-grid @-date time))
    (reset! -time time)
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
             (* 5 1000)))))

(defn refresh-time []
  (alchemy/refresh :current-time (string/join ":" (:time @-time))))

(defn main-view [node]
  (add-watch -geo :watch-geo refresh-geo)
  (add-watch -greg-year :watch-greg reset-greg-year)
  (add-watch -year :watch-year refresh-year)
  (add-watch -date :watch-date refresh-date)
  (add-watch -time :watch-time refresh-time)
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
