(ns witch-clock.text 
  (:require
   [clojure.string :as string]
   [witch-clock.macros :include-macros true :refer [inline-slurp]]))

(def ^:private raw-text
  {:intro (inline-slurp "doc/intro.md")
   :months (inline-slurp "doc/months.md")
   :seasons (inline-slurp "doc/seasons.md")
   :cycle (inline-slurp "doc/cycle.md")
   :holidays (inline-slurp "doc/holidays.md")
   :changelog (inline-slurp "doc/changelog.md")})

(def title (second (re-find #"\# (.+?)\n" (:intro raw-text))))
(def subtitle (second (re-find #"\#\# (.+?)\n" (:intro raw-text))))

(defn- md-ish
  "Who needs Marked when you can do this?"
  [s]
  (when s
    (as-> s $
      (string/replace $ #"(.+?)  \n" "$1<br>")
      (string/replace $ #"\n?(.+)\n?" "<p>$1</p>")
      (reduce
       (fn [s [form tag]]
         (string/replace s
                         (re-pattern (str form #"(.+?)" form))
                         (str "<" tag ">" "$1" "</" tag ">")))
       $
       [[#"\*\*" "strong"]
        [#"\*" "em"]])
      (string/replace $ #"\[(.+?)\]\((.+?)\)" "<a href=\"$2\">$1</a>"))))

(defn ->kw [s]
  (-> s
      string/trim
      string/lower-case
      (string/replace #"\s+" "-")
      keyword))

(defn- gather-sections
  ([s] (gather-sections s #"(\n+)?\#+ "))
  ([s prefix]
   (reduce
    (fn [acc {:keys [kw] :as section}]
      (assoc acc kw (dissoc section :kw)))
    {}
    (for [raw-section (string/split s prefix)
          :when (pos-int? (count raw-section))]
      (let [[raw-title body] (string/split (string/trim raw-section) #"\n\n" 2)
            html (md-ish body)]
        (cond->
         {:kw (->kw raw-title)
          :title (string/trim raw-title)}
          html (assoc :html html)))))))

(def sections
  (reduce
   (fn [acc [section-name s]]
     (reduce
      (fn [acc [kw section]]
        (assoc-in acc [section-name kw] section))
      acc
      (gather-sections s)))
   {}
   raw-text))
