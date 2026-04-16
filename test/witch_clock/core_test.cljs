(ns witch-clock.core-test
  (:require
   [clojure.string :as string]
   [clojure.test :refer [deftest is testing]]
   [witch-clock.calendar :as calendar]))

(deftest witch-clock-sanity-test
  (testing "Works for one hundred years."
    (doseq [[latitude longitude]
            [[45.5761 -122.6881] ; north america
             [25.2744 133.7751]  ; australia
             ]]
      (doseq [i (range 100)
              :let [greg-year (+ calendar/FIRST-CYCLE-YEAR i -50)
                    {:keys [nth-cycle months seasons conclusion cycle-end days]}
                    (calendar/from-gregorian-year greg-year latitude longitude)]]
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
        (doseq [[day next-day] (zipmap (drop-last 1 days) (drop 1 days))]
          (is (calendar/is-before (:dawn day) (:dusk day) (:dawn next-day) (:dusk next-day))
              (->> [(:dawn day) (:dusk day) (:dawn next-day) (:dusk next-day)]
                   (map #(.toLocaleString %))
                   (string/join ", "))))))))