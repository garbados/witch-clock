(ns witch-clock.calendar
  (:require
   ["astronomy-engine" :as astro]
   [clojure.string :as string]))

;; TODO: specs for testing

(def MONTHS
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

(def MONTH-NAMES
  {:month/jester "Jester"
   :month/wizard "Wizard"
   :month/diviner "Diviner"
   :month/monarch "Monarch"
   :month/steward "Steward"
   :month/hierophant "Hierophant"
   :month/lover "Lover"
   :month/courier "Courier"
   :month/warrior "Warrior"
   :month/hermit "Hermit"
   :month/trader "Trader"
   :month/nomad "Nomad"
   :month/corpse "Corpse"})

(def MOON-PHASES
  [:moon/new
   :moon/waxing
   :moon/full
   :moon/waning])

(def NEXT-PHASE
  (zipmap MOON-PHASES
          (drop 1 (cycle MOON-PHASES))))

(def PHASE-NAMES
  {:moon/new    "New"
   :moon/waxing "Waxing"
   :moon/full   "Full"
   :moon/waning "Waning"})

(def PHASE-EMOJIS
  {:moon/new    "🌑"
   :moon/waxing "🌓"
   :moon/full   "🌕"
   :moon/waning "🌗"})

(def SEASONS
  [:season/spring
   :season/summer
   :season/fall
   :season/winter])

(def SEASON-NAMES
  {:last-winter "Winter"
   :season/spring "Spring"
   :season/summer "Summer"
   :season/fall   "Fall"
   :season/winter "Winter"
   :next-spring "Spring"})

(def SEASON-EMOJIS
  {:season/spring "🌷"
   :season/summer "☀️"
   :season/fall   "🍂"
   :season/winter "❄️"})

(def NEXT-SEASON
  (zipmap (concat [:last-winter] SEASONS)
          (concat SEASONS [:next-spring])))

(def FIRST-CYCLE-YEAR 2025)
(def HOURS-IN-HALF-DAY 12)
(def MINUTES-IN-HOUR 60)
(def SECONDS-IN-MINUTE 60)

(defn- get-seasons [year & {:keys [southern?]}]
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
         (if southern?
           [(.-jun_solstice js-last-seasons)
            (.-sep_equinox js-last-seasons)
            (.-dec_solstice js-last-seasons)
            (.-mar_equinox js-seasons)
            (.-jun_solstice js-seasons)
            (.-sep_equinox js-seasons)]
           [(.-dec_solstice js-last-seasons)
            (.-mar_equinox js-seasons)
            (.-jun_solstice js-seasons)
            (.-sep_equinox js-seasons)
            (.-dec_solstice js-seasons)
            (.-mar_equinox js-next-seasons)]))]
    {:last-winter last-winter
     :season/spring spring
     :season/summer summer
     :season/fall fall
     :season/winter winter
     :next-spring next-spring}))

(def day-in-ms 86400000) ; 1000 * 60 * 60 * 24
(defn- dec-date [dt & [offset]] (new js/Date (- (.getTime dt) (or offset day-in-ms))))
(defn- inc-date [dt & [offset]] (new js/Date (+ (.getTime dt) (or offset day-in-ms))))
(defn- to-date [astro-dt] (-> astro-dt .-time .-date))
(defn- compare-dates [op dt1 dt2 & dts]
  (apply op (map #(.getTime %) (concat [dt1 dt2] dts))))
(def is-before (partial compare-dates <))
(def is-after (partial compare-dates >))
(defn days-between [days dt1 dt2]
  (count
   (filter
    (fn [dawn] (is-before dt1 dawn dt2))
    days)))

(defn- get-next-moon-phase [dt]
  (let [mq (astro/SearchMoonQuarter dt)
        phase (nth MOON-PHASES (.-quarter mq))]
    {:phase phase
     :date (to-date mq)}))

(defn- get-moon-phases-since
  ([] (get-moon-phases-since (new js/Date)))
  ([dt]
   (let [{:keys [date] :as next} (get-next-moon-phase dt)]
     (lazy-seq (cons next (get-moon-phases-since (inc-date date)))))))

(defn- get-next-dawn-dusk [dt latitude longitude height]
  (let [body (new astro/Observer latitude longitude height)
        dawn (.-date (astro/SearchRiseSet "Sun" body 1 dt 366))
        dusk (.-date (astro/SearchRiseSet "Sun" body -1 dawn 366))]
    {:dawn dawn :dusk dusk}))

(defn- get-dawn-dusk-since [dt latitude longitude height]
  (let [{:keys [dusk] :as dawn-dusk} (get-next-dawn-dusk dt latitude longitude height)]
    (lazy-seq
     (cons
      dawn-dusk
      (get-dawn-dusk-since dusk latitude longitude height)))))

(defn from-gregorian-year
  [year latitude longitude & {:keys [height] :or {height 0}}]
  (let [southern? (< latitude 0)
        {winter :season/winter
         :keys [last-winter]
         :as seasons} (get-seasons year :southern? southern?)
        start-of-cycle
        (->> (get-moon-phases-since last-winter)
             (drop-while #(not= :moon/new (:phase %)))
             first
             :date
             dec-date)
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
                [(assoc acc month (take 4 remaining-phases))
                 (drop 4 remaining-phases)]
                [acc remaining-phases])))
          [{} phases-in-cycle]
          MONTHS))
        [new-cycle-eve new-cycle-day] (take-last 2 days-in-cycle)]
    {:nth-cycle (inc (- year FIRST-CYCLE-YEAR))
     :months months
     :seasons seasons
     :conclusion (:dawn new-cycle-eve)
     :cycle-end (:dawn new-cycle-day)
     :days (drop-last days-in-cycle)}))

(defn get-holidays [{:keys [months seasons days conclusion]}]
  (sort-by
   second
   (concat
    (reduce
     (fn [acc [month phases]]
       (let [holiday-name (str "Feast of the " (string/capitalize (name month)))
             occurs-at-dt (:date (first (filter #(= :moon/full (:phase %)) phases)))
             holiday-dt (->> days
                             (filter
                              (fn [{:keys [dawn]}]
                                (is-before dawn occurs-at-dt)))
                             last
                             :dawn)]
         (conj acc [holiday-name holiday-dt occurs-at-dt])))
     []
     months)
    (reduce
     (fn [acc season]
       (let [holiday-name (str "Festival of " (string/capitalize (name season)))
             occurs-at-dt (get seasons season)
             holiday-dt (->> days
                             (filter
                              (fn [{:keys [dawn]}]
                                (is-before dawn occurs-at-dt)))
                             last
                             :dawn)
             festival-ends-dt
             (->> days
                  (filter
                   (fn [{:keys [dawn]}]
                     (is-after dawn holiday-dt)))
                  (drop 1)
                  first
                  :dawn)]
         (conj acc [holiday-name holiday-dt occurs-at-dt festival-ends-dt])))
     []
     SEASONS)
    [(let [winter-dt (get seasons :season/winter)
           respite-dt (->> days
                           (filter
                            (fn [{:keys [dawn]}]
                              (is-after dawn winter-dt)))
                           rest
                           first
                           :dawn)]
       ["Respite" respite-dt nil conclusion])
     [(if (= 12 (count months))
        "The Return"
        "The Demise")
      conclusion]])))

(defn get-day
  ([witchy-year]
   (get-day witchy-year (new js/Date)))
  ([{:keys [months seasons days cycle-end nth-cycle]} dt]
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
                (filter
                 (fn [[_cycle-i [dawn _next-dawn]]]
                   (is-before dawn dt)))
                (map
                 (fn [[cycle-i [_dawn _next-dawn]]]
                   [(inc cycle-i) [_dawn _next-dawn]]))
                last)
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
           sorted-moon-phase-dt (sort-by #(nth % 2) is-after moon-phase-dt)
           [month phase phase-dt]
           (->> sorted-moon-phase-dt
                (filter
                 (fn [[_month _phase phase-dt]]
                   (is-before dawn phase-dt)))
                last)
           [_month _phase month-dt]
           (->> sorted-moon-phase-dt
                (filter
                 (fn [[month* _phase _phase-dt]]
                   (= month month*)))
                last)
           next-moon-phases (conj sorted-moon-phase-dt [:month/jester :moon/new cycle-end])
           [next-month* next-phase next-phase-dt]
           (->> next-moon-phases
                (filter
                 (fn [[_month _phase other-phase-dt]]
                   (is-before phase-dt other-phase-dt)))
                last)
           phase-i (days-between dawns phase-dt dawn)
           phase-n (days-between dawns phase-dt next-phase-dt)
           [next-month _next-phase next-month-dt]
           (if (not= month next-month*)
             [next-month* nil next-phase-dt]
             (->> next-moon-phases
                  (filter
                   (fn [[next-month _phase next-month-dt]]
                     (and
                      (is-before month-dt next-month-dt)
                      (not= month next-month))))
                  last))
           month-i (days-between dawns month-dt dawn)
           month-n (days-between dawns month-dt next-month-dt)]
       {:cycle [nth-cycle (inc cycle-i) cycle-n]
        :season [season season-dt (inc season-i) season-n]
        :next-season [next-season next-season-dt]
        :month [month month-dt (inc month-i) month-n]
        :next-month [next-month next-month-dt]
        :phase [phase phase-dt (inc phase-i) phase-n]
        :next-phase [next-phase next-phase-dt]
        :day [dawn dusk next-dawn]}))))

(def get-hour-lengths
  (memoize
   (fn [{:keys [day] :as _witchy-now}]
     (let [[dawn dusk next-dawn] day
           daylight-ms (- (.getTime dusk) (.getTime dawn))
           nighttime-ms (- (.getTime next-dawn) (.getTime dusk))]
       {:day-hour-ms (/ daylight-ms HOURS-IN-HALF-DAY)
        :night-hour-ms (/ nighttime-ms HOURS-IN-HALF-DAY)}))))

(defn get-current-time
  ([witchy-now]
   (get-current-time witchy-now (new js/Date)))
  ([{:keys [day] :as witchy-now} dt]
   (let [{:keys [day-hour-ms night-hour-ms] :as time-meta} (get-hour-lengths witchy-now)
         [dawn-ms dusk-ms next-dawn-ms] (map #(.getTime %) day)
         now-ms (.getTime dt)
         day? (< now-ms dusk-ms)
         tomorrow? (< next-dawn-ms now-ms)]
     (if tomorrow?
       (str
        "Given now is after the associated witchy day: "
        (.toLocaleString (:dawn day))
        " < "
        (.toLocaleString dt))
       (let [witchy-hour
             (if day?
               (/ (- now-ms dawn-ms) day-hour-ms)
               (+ HOURS-IN-HALF-DAY (/ (- now-ms dusk-ms) night-hour-ms)))
             [_ hour minute second] (re-matches #"(\d{1,2})\.(\d{2})(\d{2})\d+" (str witchy-hour))
             minute (js/Math.floor (* (js/parseInt minute 10) 0.01 MINUTES-IN-HOUR))
             minute (if (= 1 (count (str minute)))
                      (str "0" minute)
                      (str minute))
             second (js/Math.floor (* (js/parseInt second 10) 0.01 SECONDS-IN-MINUTE))
             second (if (= 1 (count (str second)))
                      (str "0" second)
                      (str second))]
         (assoc time-meta :time [hour minute second]))))))
