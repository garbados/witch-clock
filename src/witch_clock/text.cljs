(ns witch-clock.text 
  (:require
   [clojure.string :as string]
   [witch-clock.macros :include-macros true :refer [inline-slurp]]))

(def ^:private raw-text
  {:intro     (inline-slurp "doc/intro.md")
   :months    (inline-slurp "doc/months.md")
   :seasons   (inline-slurp "doc/seasons.md")
   :cycle     (inline-slurp "doc/cycle.md")
   :holidays  (inline-slurp "doc/holidays.md")
   :changelog (inline-slurp "doc/changelog.md")
   :qa        (inline-slurp "doc/qa.md")
   :geo       (inline-slurp "doc/geo.md")})

(defn- md-ish
  "Who needs Marked when you can do this?"
  [s]
  (when s
    (as-> s $
      (reduce
       (fn [s [form tag]]
         (string/replace s
                         (re-pattern (str form "(.+?)" form))
                         (str "<" tag ">" "$1" "</" tag ">")))
       $
       [["\\*\\*" "strong"]
        ["\\*" "em"]])
      (string/replace $ #"- (.+)\n?" "<li>$1</li>")
      (string/replace $ #"<li>(.+)</li>" "<ul><li>$1</li></ul>")
      (string/replace $ #"(.+?)  \n" "$1<br>")
      (string/replace $ #"(.+?)\n{2}" "<p>$1</p>")
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
    (for [[i [raw-title body]]
          (->> (string/split s prefix)
               (filter (fn [raw-section] (pos-int? (count raw-section))))
               (map (fn [raw-section] (string/split (string/trim raw-section) #"\n\n" 2)))
               (filter (fn [[raw-title _body]] (pos-int? (count raw-title))))
               (map-indexed vector))
          :let [title (string/trim raw-title)
                html (when (pos-int? (count body)) (md-ish body))]]
      (cond->
       {:i i
        :kw (->kw title)
        :title title
        :body body}
        html (assoc :html html))))))

  (def sections
    (reduce
     (fn [acc [section-name s]]
       (let [sections (gather-sections s)]
         (reduce
          (fn [acc [kw {:keys [i] :as section}]]
            (-> acc
                (assoc-in [section-name kw] section)
                (cond->
                 (= i 0) (assoc-in [section-name :header] section))))
          (assoc-in acc [section-name :main]
                    (map second (rest (sort-by #(-> % rest first :i) sections))))
          sections)))
     {}
     raw-text))

(def title (get-in sections [:intro :header :title]))
(def subtitle (get-in sections [:intro :header :body]))
  