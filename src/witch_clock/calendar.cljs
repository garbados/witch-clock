(ns witch-clock.calendar
  (:require
   ["astronomy-engine" :as astro]
   [clojure.string :as string]))

;; TODO: specs for testing

(def MONTH_NAMES
  [:month/jester
   :month/wizard
   :month/diviner
   :month/monarch
   :month/steward
   :month/hierophant
   :month/lover
   :month/courier
   :month/warrior
   :month/hermit
   :month/trader
   :month/nomad
   :month/corpse])

(def MONTH_PHASES
  [:moon/new
   :moon/waxing
   :moon/full
   :moon/waning])

(def SEASONS
  [:spring
   :summer
   :fall
   :winter])

(defn- get-seasons [year]
  (let [js-seasons (astro/Seasons year)
        js-last-seasons (astro/Seasons (dec year))
        [last-winter
         spring
         summer
         fall
         winter]
        (map
         #(-> % .-date)
         [(.-dec_solstice js-last-seasons)
          (.-mar_equinox js-seasons)
          (.-jun_solstice js-seasons)
          (.-sep_equinox js-seasons)
          (.-dec_solstice js-seasons)])]
    {:last-winter last-winter
     :spring spring
     :summer summer
     :fall fall
     :winter winter}))

(defn- inc-date [dt] (new js/Date (inc (.getTime dt))))
(defn- dec-by-a-day [dt] (new js/Date (- (.getTime dt) 86400000))) ; 1000 * 60 * 60 * 24
(defn- to-date [astro-dt] (-> astro-dt .-time .-date))
(defn- compare-dates [op dt1 dt2 & dts]
  (apply op (map #(.getTime %) (concat [dt1 dt2] dts))))
(def ^:private is-before (partial compare-dates <))

(defn- get-next-moon-phase [dt]
  (let [mq (astro/SearchMoonQuarter dt)
        phase (nth MONTH_PHASES (.-quarter mq))]
    {:phase phase
     :date (to-date mq)}))

(defn- get-moon-phases-since
  ([] (get-moon-phases-since (new js/Date)))
  ([dt]
   (let [{:keys [date] :as next} (get-next-moon-phase dt)]
     (lazy-seq (cons next (get-moon-phases-since (inc-date date)))))))

(defn- get-next-dawn-dusk [dt lat lon height]
  (let [body (clj->js
              {:latitude lat
               :longitude lon
               :height height})]
    {:dawn
     (to-date (astro/SearchRiseSet "Sun" body 1 dt 366))
     :dusk
     (to-date (astro/SearchRiseSet "Sun" body -1 dt 366))}))

(defn- get-dawn-dusk-since [dt lat lon height]
  (let [dawn-dusk (get-next-dawn-dusk dt lat lon height)
        next-dt (-> dawn-dusk :dusk to-date inc-date)]
    (lazy-seq
     (cons
      (get-next-dawn-dusk dt lat lon height)
      (get-dawn-dusk-since next-dt lat lon height)))))

(defn from-gregorian-year
  [year & {:keys [lat lon height]
           :or {height 0}}]
  (let [{:keys [last-winter winter] :as seasons*} (get-seasons year)
        seasons (dissoc seasons* :last-winter)
        start-of-cycle
        (->> (get-moon-phases-since last-winter)
             (drop-while #(not= :moon/new (:phase %)))
             first
             :date)
        start-of-next-cycle
        (->> (get-moon-phases-since winter)
             (drop-while #(not= :moon/new (:phase %)))
             first
             :date)
        phases-in-cycle
        (take-while
         #(is-before (:date %) start-of-next-cycle)
         (get-moon-phases-since start-of-cycle))
        days-in-cycle
        (when (and lat lon)
          (take-while
           #(is-before (:dawn %) start-of-next-cycle)
           (get-dawn-dusk-since start-of-cycle lat lon height)))
        months
        (first
         (reduce
          (fn [[acc remaining-phases] month]
            (let [weeks (take 4 remaining-phases)]
              (if (seq weeks)
                [(conj acc [month (take 4 remaining-phases)])
                 (drop 4 remaining-phases)]
                [acc remaining-phases])))
          [[] phases-in-cycle]
          MONTH_NAMES))]
    (cond->
     {:months months
      :seasons seasons
      :conclusion (dec-by-a-day start-of-next-cycle)}
      days-in-cycle (assoc :days days-in-cycle))))

(defn get-holidays [witch-year]
  (sort-by
   second
   (concat
    (reduce
     (fn [acc [month phases]]
       (let [holiday-name (str "Feast of the " (string/capitalize (name month)))
             holiday-date (:date (first (filter #(= :moon/full (:phase %)) phases)))]
         (conj acc [holiday-name holiday-date])))
     []
     (:months witch-year))
    (reduce
     (fn [acc season]
       (let [holiday-name (str "Festival of " (string/capitalize (name season)))
             holiday-date (get-in witch-year [:seasons season])]
         (conj acc [holiday-name holiday-date])))
     []
     SEASONS)
    [["Beginning of Respite" (get-in witch-year [:seasons :winter])]
     [(if (= 12 (count (:months witch-year)))
        "The Return"
        "The Demise")
      (:conclusion witch-year)]])))
