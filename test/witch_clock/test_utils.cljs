(ns witch-clock.test-utils
  (:require [clojure.test :refer [is testing]]
            [clojure.spec.test.alpha :as stest]
            [clojure.spec.alpha :as s]))

(def default-test-opts {:num-tests 100})

(defn failed-checks [sym opts]
  (->> (stest/check sym {:clojure.spec.test.check/opts opts})
       (map stest/abbrev-result)
       (filter :failure)))

(defn stest-symbol!
  ([sym] (stest-symbol! sym default-test-opts))
  ([sym opts]
   (testing (str sym)
     (let [{:keys [failure]} (first (failed-checks sym opts))]
       (is (nil? failure)
           (ex-message failure))))))

(defn stest-ns!
  ([ns-name]
   (stest-ns! ns-name default-test-opts))
  ([ns-name opts]
   (doseq [[sym var-ref] (ns-publics ns-name)
           :let [spec (s/get-spec var-ref)
                 {no-stest? :no-stest} (meta var-ref)]
           :when (and (fn? @var-ref)
                      (not no-stest?))]
     (testing (str ns-name "/" sym)
       (if spec
         (stest-symbol! (symbol var-ref) opts)
         (is (some? spec) (str sym " has no spec!")))))))
