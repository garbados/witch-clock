(ns witch-clock.alchemy
  (:require
   ["html-alchemist" :as alchemy]))

(def refresh alchemy/refresh)
(def snag alchemy/snag)
(def profane alchemy/profane)

(defn alchemize
  "Clojure-friendly wrapper around Alchemist's alchemize function."
  [expr]
  (alchemy/alchemize (clj->js expr)))
