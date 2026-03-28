(ns witch-clock.geo)

;; TODO: multiple locations

(def LOCAL_ID "_witchy_latlong")

(defn to-coords [js-coords]
  {:latitude (-> js-coords .-coords .-latitude)
   :longitude (-> js-coords .-coords .-longitude)})

;; async function getCurrentPosition () {
;;   return new Promise((resolve, reject) => {
;;     try {
;;       navigator.geolocation.getCurrentPosition(resolve, reject)
;;     } catch (e) {
;;       reject(e)
;;     }
;;   })
;; }

(defn get-current-position []
  (new js/Promise (fn [resolve reject]
                    (try
                      (js/navigator.geolocation.getCurrentPosition (comp resolve to-coords) reject)
                      (catch js/Object e (reject e))))))

;; async function saveCurrentPosition ({ latitude, longitude, remembered }) {
;;   localStorage.setItem('_witchy_latlong', JSON.stringify({ latitude, longitude, remembered }))
;; }

(defn save-current-position [coords]
  (js/localStorage.setItem LOCAL_ID (js/JSON.stringify (clj->js coords))))

;; async function recallCurrentPosition () {
;;   const s = localStorage.getItem('_witchy_latlong')
;;   if (s) return JSON.parse(s)
;; }

(defn recall-current-position []
  (new js/Promise
       (fn [resolve _reject]
         (if-let [s (js/localStorage.getItem LOCAL_ID)]
           (resolve (js->clj (js/JSON.parse s) :keywordize-keys true))
           (resolve nil)))))

;; async function fetchCurrentPosition (remembered) {
;;   const { coords: { latitude, longitude } } = await getCurrentPosition()
;;   const position = { latitude, longitude, remembered }
;;   if (remembered) await saveCurrentPosition(position)
;;   return position
;; }

(defn fetch-current-position [remembered]
  (.then
   (get-current-position)
   #(do
      (when remembered
        (save-current-position %))
      %)))
