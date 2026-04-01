(ns witch-clock.calendar
  (:require
   ["astronomy-engine" :as astro]
   [clojure.string :as string]))

;; TODO: specs for testing

(def MONTH-NAMES
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

(def MONTH-PHASES
  [:moon/new
   :moon/waxing
   :moon/full
   :moon/waning])

(def SEASONS
  [:season/spring
   :season/summer
   :season/fall
   :season/winter])

(def NEXT-SEASON
  (zipmap (concat [:last-winter] SEASONS)
          (concat SEASONS [:next-spring])))

(def FIRST-CYCLE-YEAR 2025)

(defn- get-seasons [year]
  (let [js-seasons (astro/Seasons year)
        js-last-seasons (astro/Seasons (dec year))
        js-next-seasons (astro/Seasons (inc year))
        [last-winter
         spring
         summer
         fall
         winter
         next-spring]
        (map
         #(-> % .-date)
         [(.-dec_solstice js-last-seasons)
          (.-mar_equinox js-seasons)
          (.-jun_solstice js-seasons)
          (.-sep_equinox js-seasons)
          (.-dec_solstice js-seasons)
          (.-mar_equinox js-next-seasons)])]
    {:last-winter last-winter
     :season/spring spring
     :season/summer summer
     :season/fall fall
     :season/winter winter
     :next-spring next-spring}))

(def day-in-ms 86400000) ; 1000 * 60 * 60 * 24
(defn- dec-by-a-day [dt] (new js/Date (- (.getTime dt) day-in-ms)))
(defn- inc-by-a-day [dt] (new js/Date (+ (.getTime dt) day-in-ms)))
(defn- to-date [astro-dt] (-> astro-dt .-time .-date))
(defn- compare-dates [op dt1 dt2 & dts]
  (apply op (map #(.getTime %) (concat [dt1 dt2] dts))))
(def ^:private is-before (partial compare-dates <))
(def ^:private is-after (partial compare-dates >))
(defn days-between [days dt1 dt2]
  (count
   (filter
    (fn [dawn] (is-before dt1 dawn dt2))
    days)))

(defn- get-next-moon-phase [dt]
  (let [mq (astro/SearchMoonQuarter dt)
        phase (nth MONTH-PHASES (.-quarter mq))]
    {:phase phase
     :date (to-date mq)}))

(defn- get-moon-phases-since
  ([] (get-moon-phases-since (new js/Date)))
  ([dt]
   (let [{:keys [date] :as next} (get-next-moon-phase dt)]
     (lazy-seq (cons next (get-moon-phases-since (inc-by-a-day date)))))))

(defn- get-next-dawn-dusk [dt latitude longitude height]
  (let [body (new astro/Observer latitude longitude height)]
    {:dawn
     (.-date (astro/SearchRiseSet "Sun" body 1 dt 366))
     :dusk
     (.-date (astro/SearchRiseSet "Sun" body -1 (inc-by-a-day dt) 366))}))

(defn- get-dawn-dusk-since [dt latitude longitude height]
  (lazy-seq
   (cons
    (get-next-dawn-dusk dt latitude longitude height)
    (get-dawn-dusk-since (inc-by-a-day dt) latitude longitude height))))

(defn from-gregorian-year
  [year latitude longitude & {:keys [height] :or {height 0}}]
  (let [{winter :season/winter
         :keys [last-winter]
         :as seasons} (get-seasons year)
        start-of-cycle
        (->> (get-moon-phases-since last-winter)
             (drop-while #(not= :moon/new (:phase %)))
             first
             :date
             dec-by-a-day)
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
        (take-while
         #(is-before (:dawn %) start-of-next-cycle)
         (get-dawn-dusk-since start-of-cycle latitude longitude height))
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
          MONTH-NAMES))
        [new-cycle-eve new-cycle-day] (take-last 2 days-in-cycle)]
    {:cycle (inc (- year FIRST-CYCLE-YEAR))
     :months months
     :seasons seasons
     :conclusion (:dawn new-cycle-eve)
     :cycle-end (:dawn new-cycle-day)
     :days (drop-last days-in-cycle)}))

(defn get-holidays [{:keys [months seasons] :as witch-year}]
  (sort-by
   second
   (concat
    (reduce
     (fn [acc [month phases]]
       (let [holiday-name (str "Feast of the " (string/capitalize (name month)))
             holiday-date (:date (first (filter #(= :moon/full (:phase %)) phases)))]
         (conj acc [holiday-name holiday-date])))
     []
     months)
    (reduce
     (fn [acc season]
       (let [holiday-name (str "Festival of " (string/capitalize (name season)))
             holiday-date (get seasons season)]
         (conj acc [holiday-name holiday-date])))
     []
     SEASONS)
    [["Beginning of Respite" (get seasons :season/winter)]
     [(if (= 12 (count (:months witch-year)))
        "The Return"
        "The Demise")
      (:conclusion witch-year)]])))

(defn get-now [{:keys [months seasons days cycle-end]} dt]
  (cond
    (is-before dt (:dawn (first days)))
    (str "Date is before first dawn: "
         (.toLocaleString dt)
         " < "
         (.toLocaleString (:dawn (first days))))
    (is-after dt cycle-end)
    (str "Date is after cycle end: "
         (.toLocaleString cycle-end)
         " < "
         (.toLocaleString dt))
    :else
    (let [dawns (map :dawn days)
          dawn-to-dawn
          (->> (conj (vec (rest dawns)) cycle-end)
               (map vector dawns)
               (map-indexed vector))
          cycle-n (count days)
          [cycle-i [dawn next-dawn]]
          (->> dawn-to-dawn
               (drop-while #(is-before (first (second %)) dt))
               first)
          dusk
          (->> days
               (filter
                (fn [day] (= (:dawn day) dawn)))
               first
               :dusk)
          [season season-dt]
          (->> (sort-by second is-after seasons)
               (filter
                (fn [[_season season-dt]]
                  (is-before season-dt dawn)))
               first)
          next-season (get NEXT-SEASON season)
          next-season-dt (get seasons next-season)
          season-i (days-between dawns season-dt dawn)
          season-n (days-between dawns season-dt next-season-dt)
          moon-phase-dt
          (->> months
               (reduce
                (fn [acc [month phases]]
                  (reduce
                   (fn [acc {:keys [phase date]}]
                     (conj acc [month phase date]))
                   acc
                   phases))
                []))
          sorted-moon-phase-dt (sort-by #(nth % 2) is-before moon-phase-dt)
          [month phase phase-dt]
          (->> sorted-moon-phase-dt
               (filter
                (fn [[_month _phase phase-dt]]
                  (is-before phase-dt dawn)))
               last)
          [next-month next-phase next-phase-dt]
          (->> sorted-moon-phase-dt
               (filter
                (fn [[_month _phase other-phase-dt]]
                  (is-after other-phase-dt phase-dt)))
               first)
          phase-i (days-between dawns phase-dt dawn)
          phase-n (days-between dawns phase-dt next-phase-dt)]
      {:cycle [(inc cycle-i) cycle-n]
       :season [season season-dt (inc season-i) season-n]
       :next-season [next-season next-season-dt]
       :month [month phase phase-dt (inc phase-i) phase-n]
       :next-month [next-month next-phase next-phase-dt]
       :day [dawn dusk next-dawn]})))
