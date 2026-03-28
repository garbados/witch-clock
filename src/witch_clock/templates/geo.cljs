(ns witch-clock.templates.geo
  (:require
   [witch-clock.alchemy :refer [snag profane]]
   [witch-clock.geo :refer [get-current-position save-current-position forget-current-position]]
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
  [[:section.content
    [:h2 "Hold on! Time is relative to space, so I need to know where you are."]
    (profane :div (get-in sections [:intro :geolocation :html]))]
   (when remember-id (remember-geo-check remember-id))
   [(str "input#" geo-permission-id)
    {:type :button
     :onclick (fn []
                (.then (get-current-position)
                       (fn [coords]
                         (when (and remember-id
                                    (.-checked (snag (name remember-id))))
                           (save-current-position coords))
                         (reset! -geo coords))))
     :value "OK!"}]])

(defn reset-geo-form [id -geo]
  [(str "input.pico-background-orange-200#" id)
   {:type :button
    :onclick (fn [] (.then (get-current-position) (fn [coords] (reset! -geo coords))))
    :value "Reset location with GPS"}])

(defn forget-geo-form [id -geo]
  [(str "input.pico-background-cyan-100#" id)
   {:type :button
    :onclick (fn []
               (when (js/confirm "Do you want to forget your saved location?")
                 (forget-current-position)
                 (reset! -geo nil)))
    :value "Forget saved location"}])

(defn custom-geo-form
  [-geo & {:keys [remember-id geo-lat-id geo-lon-id]
           :or {geo-lat-id geo-lat-id
                geo-lon-id geo-lon-id}}]
  (let [{:keys [latitude longitude]
         :or {latitude 0 longitude 0}} @-geo]
    [[:p, "Or, you can enter a custom latitude and longitude."],
     [(str "input#" geo-lat-id) (assoc decimal-input-options :value latitude)]
     [(str "input#" geo-lon-id) (assoc decimal-input-options :value longitude)]
     (when remember-id (remember-geo-check remember-id))
     [(str "input#" custom-geo-id)
      {:type :button
       :onclick (fn [] (js/console.log "clicked!"))
       :value "OK!"}]]))
