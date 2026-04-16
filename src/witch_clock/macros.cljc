(ns witch-clock.macros)

(defmacro inline-slurp [path]
  #_{:clj-kondo/ignore [:unresolved-var]}
  (clojure.core/slurp path))
