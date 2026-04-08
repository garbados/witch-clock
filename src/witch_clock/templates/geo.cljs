(ns witch-clock.templates.geo
  (:require
   [witch-clock.alchemy :refer [snag profane]]
   [witch-clock.geo :as geo]
   [witch-clock.text :as text :refer [sections]]))

(def decimal-input-options {:type "text" :inputmode "decimal"})
(def save-geo-id :remember-requested-geo)
(def save-custom-geo-id :remember-custom-geo)
(def geo-reset-id :geo-reset)
(def geo-forget-id :geo-forget)
(def geo-lat-id :geo-latitude)
(def geo-lon-id :geo-longitude)
(def custom-geo-id :geo-custom)
(def geo-permission-id :geo-permission)

(defn remember-geo-check [id]
  [:fieldset
   [:label
    [(str "input#" (name id))
     {:type "checkbox" :checked true}]
    "Remember location locally"]])

(defn ask-for-geo-form [-geo
                        & {:keys [remember-id geo-permission-id]
                           :or {geo-permission-id geo-permission-id}}]
  [(profane :div (get-in sections [:intro :geolocation :html]))
   (when remember-id (remember-geo-check remember-id))
   [(str "input#" (name geo-permission-id))
    {:type :button
     :onclick (fn []
                (let [remember? (and remember-id (.-checked (snag (name remember-id))))]
                  (.then (geo/fetch-current-position remember?)
                         (fn [coords] (reset! -geo coords)))))
     :value "OK!"}]])

(defn reset-geo-form [id -geo]
  [(str "input.pico-background-orange-200#" (name id))
   {:type :button
    :onclick (fn []
               (when (js/confirm "Do you want to reset your location using GPS?")
                 (.then (geo/get-current-position)
                        (fn [coords] (reset! -geo coords)))))
    :value "Reset location with GPS"}])

(defn forget-geo-form [id -geo]
  [(str "input.pico-background-cyan-100#" (name id))
   {:type :button
    :onclick (fn []
               (when (js/confirm "Do you want to forget your saved location?")
                 (geo/forget-current-position)
                 (reset! -geo nil)))
    :value "Forget saved location"}])

(defn custom-geo-form
  [-geo & {:keys [remember-id geo-lat-id geo-lon-id]
           :or {geo-lat-id geo-lat-id
                geo-lon-id geo-lon-id}}]
  (let [{:keys [latitude longitude]
         :or {latitude 0 longitude 0}} @-geo]
    [[:p, "Or, you can enter a custom latitude and longitude."]
     [(str "input#" (name geo-lat-id)) (assoc decimal-input-options :value latitude)]
     [(str "input#" (name geo-lon-id)) (assoc decimal-input-options :value longitude)]
     (when remember-id (remember-geo-check remember-id))
     [(str "input#" (name custom-geo-id))
      {:type :button
       :onclick (fn []
                  (let [latitude (.-value (snag geo-lat-id))
                        longitude (-> geo-lon-id snag .-value)
                        coords {:latitude latitude :longitude longitude}]
                    (reset! -geo coords)))
       :value "OK!"}]]))

(defn ask-for-geo [-geo]
  [:section
   (if (nil? @-geo)
     [[:hgroup.has-text-centered
       [:h2 "Hold on!"]
       [:p "Time is relative to space, so I need to know where you are."]]
      [(ask-for-geo-form -geo :remember-id save-geo-id)
       (custom-geo-form -geo :remember-id save-custom-geo-id)]]
     [[:article>details
       [:summary>hgroup>h2.has-text-centered "Geolocation"]
       [(reset-geo-form geo-reset-id -geo)
        (forget-geo-form geo-forget-id -geo)
        (custom-geo-form -geo :remember-id save-custom-geo-id)]]])])
