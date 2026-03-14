(ns witch-clock.text 
  (:require
    [clojure.string :as string]))

(defmacro inline-slurp [path]
  #_{:clj-kondo/ignore [:unresolved-var]}
  (clojure.core/slurp path))

(def raw-text
  {:intro (inline-slurp "doc/intro.md")
   :months (inline-slurp "doc/months.md")
   :seasons (inline-slurp "doc/seasons.md")
   :cycle (inline-slurp "doc/cycle.md")})

(def title (second (re-find #"\# ([\w ]+)\n" (:intro raw-text))))
(def subtitle (second (re-find #"\#\# ([\w ]+)\n" (:intro raw-text))))

(defn gather-sections
  ([s] (gather-sections s #"\#\#\#"))
  ([s prefix]
   (for [section (string/split s prefix)]
     (let [[header body] (string/split section #"\n\n" 1)]
       {:header header :body body}))))

(defn md-ish [s]
  (if-let [[w-fmt to-i] (re-find #"\*([\w ]+?)\*" s)]
    (string/replace-first s (re-pattern w-fmt) (str "<em>" to-i "</em>"))
    s))
