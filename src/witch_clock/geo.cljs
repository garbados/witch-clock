(ns witch-clock.geo)

;; TODO: multiple locations

(def local-id "_witchy_latlong")

(defn to-coords [js-coords]
  {:latitude (-> js-coords .-coords .-latitude)
   :longitude (-> js-coords .-coords .-longitude)})

(defn get-current-position []
  (new js/Promise (fn [resolve reject]
                    (try
                      (js/navigator.geolocation.getCurrentPosition (comp resolve to-coords) reject)
                      (catch js/Object e (reject e))))))


(defn save-current-position [coords]
  (js/localStorage.setItem local-id (js/JSON.stringify (clj->js coords))))

(defn forget-current-position []
  (js/localStorage.removeItem local-id)) 

(defn recall-current-position []
  (new js/Promise
       (fn [resolve _reject]
         (if-let [s (js/localStorage.getItem local-id)]
           (resolve (js->clj (js/JSON.parse s) :keywordize-keys true))
           (resolve nil)))))

(defn fetch-current-position [remembered]
  (.then
   (get-current-position)
   #(do
      (when remembered
        (save-current-position %))
      %)))
