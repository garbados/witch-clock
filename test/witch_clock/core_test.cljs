(ns witch-clock.core-test
  (:require
   [clojure.string :as string]
   [clojure.test :refer [is testing deftest]]
   [witch-clock.calendar :as calendar]))

(deftest witch-clock-sanity-test
  (doseq [greg-year (map #(+ calendar/FIRST-CYCLE-YEAR % -5) (range 10))
          [latitude longitude]
          [[45.5761 -122.6881] ; north america
           [25.2744 133.7751]  ; australia
           ]]
    (let [{:keys [nth-cycle months seasons conclusion cycle-end days]
           :as witchy-year}
          (calendar/from-gregorian-year greg-year latitude longitude)]
      (println (str "Testing: " (string/join " ; " [greg-year latitude longitude])))
      (is (number? nth-cycle))
      (doseq [month calendar/MONTHS
              :when (get months month)
              :let [i (inc (.indexOf calendar/MONTHS month))
                    next-month (nth calendar/MONTHS i nil)
                    [new-moon waxing-moon full-moon waning-moon] (map :date (get months month))]]
        (is (calendar/is-before new-moon waxing-moon full-moon waning-moon))
        (if (get months next-month)
          (let [next-new-moon (-> months next-month first :date)]
            (is (calendar/is-before waning-moon next-new-moon)))
          (is (calendar/is-before waning-moon cycle-end))))
      (doseq [season calendar/SEASONS
              :let [next-season (get calendar/NEXT-SEASON season)]]
        (is (calendar/is-before (get seasons season) (get seasons next-season))))
      (is (calendar/is-before conclusion cycle-end))
      (doseq [[day next-day] (zipmap (drop-last 1 days) (drop 1 days))
              :let [date (calendar/get-date witchy-year (:dawn day))
                    next-date (calendar/get-date witchy-year (:dawn next-day))]]
        (is (calendar/is-before (:dawn day) (:dusk day) (:dawn next-day) (:dusk next-day))
            (->> [(:dawn day) (:dusk day) (:dawn next-day) (:dusk next-day)]
                 (map #(.toLocaleString %))
                 (string/join ", ")))
        (is (apply calendar/is-or-before (concat (:day date) (:day next-date))))
        (let [[month _month-dt month-i :as today-month] (:month date)
              [tmrw-month _tmrw-month-dt tmrw-month-i :as tmrw-month*] (:month next-date)]
          (if (= month tmrw-month)
            (is (= (inc month-i) tmrw-month-i)
                (str [today-month tmrw-month*]))
            (is (= 1 tmrw-month-i)
                (str tmrw-month*))))
        (let [[phase _phase-dt phase-i :as today-phase] (:phase date)
              [tmrw-phase _tmrw-phase-dt tmrw-phase-i :as tmrw-phase*] (:phase next-date)]
          (if (= phase tmrw-phase)
            (is (= (inc phase-i) tmrw-phase-i)
                (str [today-phase tmrw-phase*]))
            (is (= 1 tmrw-phase-i)
                (str tmrw-phase*))))
        (let [[season _season-dt season-i :as today-season] (:season date)
              [tmrw-season _tmrw-season-dt tmrw-season-i :as tmrw-season*] (:season next-date)]
          (if (= season tmrw-season)
            (is (= (inc season-i) tmrw-season-i)
                (str [today-season tmrw-season*]))
            (is (= 1 tmrw-season-i)
                (str tmrw-season*))))))))
