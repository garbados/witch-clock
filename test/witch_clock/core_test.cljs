(ns witch-clock.core-test
  (:require
   [clojure.test :refer [deftest is testing]]
   [witch-clock.test-utils :refer [stest-ns!]]))

(deftest a-test
  (testing "FIXME, I fail."
    (is (= 0 1))))

(def except-ns #{'witch-clock.test-utils})

(def all-ns
  ["witch-clock.calendar"])

(deftest all-ns-test
  (doall
   (->> all-ns
        (map symbol)
        (filter #(not (contains? except-ns %)))
        (map stest-ns!))))
