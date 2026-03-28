(ns witch-clock.alchemy
  (:require
   ["html-alchemist" :as alchemy]))

(defn refresh [id expr] (alchemy/refresh (name id) (clj->js expr)))
(defn snag [id] (alchemy/snag (name id)))
(defn profane [tag expr] (alchemy/profane (name tag) expr))

(defn alchemize
  "Clojure-friendly wrapper around Alchemist's alchemize function."
  [expr]
  (alchemy/alchemize (clj->js expr)))

(defn listen-to [id event cb]
  (alchemy/listento (str id) (str event) cb))
