(ns witch-clock.templates.calendar
  (:require
   [clojure.string :as string]
   [witch-clock.alchemy :as alchemy]
   [witch-clock.calendar :as calendar]
   [witch-clock.text :as text]))

(def GREG-HOUR-MS (* 1000 60 60))
(defn calendar-time [time]
  (let [{:keys [time day-hour-ms night-hour-ms]} time]
    [:article
     {:data-tooltip
      (string/join
       " "
       (if (< (first time) calendar/HOURS-IN-HALF-DAY)
         ["Daylight hours are"
          (subs (str (/ day-hour-ms GREG-HOUR-MS)) 0 4)
          "Gregorian hours long."]
         ["Night hours are"
          (subs (str (/ night-hour-ms GREG-HOUR-MS)) 0 4)
          "Gregorian hours long."]))}
     [:span#current-time {:style "font-family: monospace, monospace;"} (string/join ":" time)]]))

(defn calendar-grid [date time]
  (let [{[nth-cycle cycle-i cycle-n] :cycle
         [season _season-dt season-i season-n] :season
         [month _month-dt month-i month-n] :month
         [phase _phase-dt phase-i phase-n] :phase} date]
    [:section>div.grid.has-text-centered
     [:div>article
      {:data-tooltip (str "Day " cycle-i " / " cycle-n " of Cycle " nth-cycle)}
      (str nth-cycle " : " cycle-i " / " cycle-n)]
     [:div>article
      {:data-tooltip (str "Day " season-i " / " season-n " of " (get calendar/SEASON-NAMES season))}
      (str (get calendar/SEASON-EMOJIS season) " " season-i " / " season-n)]
     [:div>article
      {:data-tooltip (str "Day " month-i " / " month-n " of the " (get calendar/MONTH-NAMES month) "'s Moon")}
      (str (get calendar/MONTH-NAMES month) " " month-i " / " month-n)]
     [:div>article
      {:data-tooltip (str "Day " phase-i " / " phase-n " of the " (get calendar/PHASE-NAMES phase) " Moon")}
      (str (get calendar/PHASE-EMOJIS phase) " " phase-i " / " phase-n)]
     [:div#time (calendar-time time)]]))

(defn explain-date [witchy-year date time]
  (let [{[nth-cycle cycle-i cycle-n] :cycle
         [season _season-dt season-i season-n] :season
         [next-season _next-season-dt] :next-season
         [month _month-dt month-i month-n] :month
         [next-month _next-month-dt] :next-month
         [phase _phase-dt phase-i phase-n] :phase
         [next-phase _next-phase-dt] :next-phase
         [dawn dusk next-dawn] :day} date
        {[hour _minute _second] :time
         :keys [day-hour-ms night-hour-ms]} time
        season-name (get calendar/SEASON-NAMES season)
        next-season-name (get calendar/SEASON-NAMES next-season)
        month-name (get calendar/MONTH-NAMES month)
        next-month-name (get calendar/MONTH-NAMES next-month)
        phase-name (get calendar/PHASE-NAMES phase)
        next-phase-name (get calendar/PHASE-NAMES next-phase)
        holidays (calendar/get-holidays witchy-year)
        today-holidays
        (filter
         (fn [[holiday holiday-dt occurs-at-dt holiday-ends-dt]]
           (and
            (not= holiday "Respite") ; Respite has special handling
            (or (= (.getTime dawn) (.getTime holiday-dt))
                (when occurs-at-dt
                  (calendar/is-before dawn occurs-at-dt next-dawn))
                (when holiday-ends-dt
                  (calendar/is-before holiday-dt dawn holiday-ends-dt)))))
         holidays)
        [_respite-begins-holiday respite-begins-dt _respite-occurs-at-dt respite-ends-dt]
        (->> holidays
             (filter (fn [[holiday]] (= holiday "Respite")))
             first)
        [last-holiday] (last holidays)
        in-respite? (calendar/is-before respite-begins-dt dusk respite-ends-dt)]
    [:section
     [:header>hgroup
      [:h3 "About today"]]
     [:ul
      [:li (str "It is day " cycle-i " of Cycle " nth-cycle "'s " cycle-n " days. "
                (let [til-cycle (inc (- cycle-n cycle-i))
                      next-cycle (inc nth-cycle)]
                  (if (= 1 til-cycle)
                    (str "Cycle " next-cycle " starts tomorrow.")
                    (str til-cycle " days until Cycle " next-cycle "."))))]
      [:li (str "It is day " season-i " of " season-name "'s " season-n " days. "
                (let [til-season (inc (- season-n season-i))]
                  (if (= 1 til-season)
                    (str next-season-name " starts tomorrow.")
                    (str til-season " days until " next-season-name "."))))]
      [:li (str "It is day " month-i " of the " month-n " days in the " month-name "'s Moon. "
                (let [til-month (inc (- month-n month-i))]
                  (if (= 1 til-month)
                    (str "The " next-month-name "'s Moon starts tomorrow.")
                    (str til-month " days until the " next-month-name "'s Moon."))))]
      [:li (str "It is day " phase-i " of the " phase-name " Moon's " phase-n " days. "
                (let [til-phase (inc (- phase-n phase-i))]
                  (if (= 1 til-phase)
                    (str "The " next-phase-name " Moon starts tomorrow.")
                    (str til-phase " days until the " next-phase-name " Moon."))))]
      [:li (str "Today began at " (.toLocaleString dawn) ". Daylight hours are " (subs (str (/ day-hour-ms GREG-HOUR-MS)) 0 4) " Gregorian hours long.")]
      [:li
       (str
        (if (< hour calendar/HOURS-IN-HALF-DAY)
          (str "Night begins at " (.toLocaleString dusk) ".")
          (str "Night began at " (.toLocaleString dusk) "."))
        " Night hours are " (subs (str (/ night-hour-ms GREG-HOUR-MS)) 0 4) " Gregorian hours long.")]
      [:li (str "Tomorrow begins at " (.toLocaleString next-dawn) ".")]
      (for [[holiday holiday-dt occurs-at-dt holiday-ends-dt] today-holidays]
        [:li>strong
         (cond->
          (str "Today is the " holiday " which begins at " (.toLocaleString holiday-dt))
           occurs-at-dt
           (str " and occurs at " (.toLocaleString occurs-at-dt))
           holiday-ends-dt
           (str " and lasts until " (.toLocaleString holiday-ends-dt))
           :finally
           (str "."))])
      (when in-respite?
        [:li>strong (str "Today is in Respite, which began at "
                         (.toLocaleString respite-begins-dt)
                         " and ends at "
                         (.toLocaleString respite-ends-dt)
                         " with the "
                         last-holiday ".")])]]))

(defn current-calendar [witchy-year date time]
  [:section
   (calendar-grid date time)
   (explain-date witchy-year date time)])

(defn current-holidays [witchy-year]
  [:section
   [:hgroup
    [:h3 (get-in text/sections [:holidays :header :title])]
    (alchemy/profane :p (get-in text/sections [:holidays :header :html]))]
   (for [[holiday dt occurs-at-dt ends-dt] (calendar/get-holidays witchy-year)
         :let [kw (text/->kw holiday)]]
     [:article
      [:hgroup
       [:h3 (str holiday)]
       [:p
        [:span (.toLocaleString dt)]
        (when occurs-at-dt
          [:span (str " ; occurs at " (.toLocaleString occurs-at-dt))])
        (when ends-dt
          [:span (str " ; ends at " (.toLocaleString ends-dt))])]]
      (alchemy/profane :span (get-in text/sections [:holidays kw :html] ""))])])

(defn explain-seasons [{:keys [seasons days] :as _witchy-year}]
  [:section
   [:hgroup
    [:h2 (get-in text/sections [:seasons :header :title])]
    (when-let [html (get-in text/sections [:seasons :header :html])]
      (alchemy/profane :p html))]
   (for [season calendar/SEASONS
         :let [season-name (get calendar/SEASON-NAMES season)
               {:keys [title html]} (get-in text/sections [:seasons (text/->kw season-name)])
               season-start (get seasons season)
               season-start-day
               (->> days
                    (filter
                     (fn [{:keys [dawn]}]
                       (calendar/is-before dawn season-start)))
                    last)]]
     [:section>article
      [:hgroup
       [:h3 title]
       [:p
        [:p
         [:span (.toLocaleString (:dawn season-start-day))]
         [:span (str " ; occurs at " (.toLocaleString season-start))]]]]
      (when html
        (alchemy/profane :p html))])])

(defn explain-months [{:keys [months days] :as _witchy-year}]
  [:section
   [:hgroup
    [:h2 (get-in text/sections [:months :header :title])]
    (when-let [html (get-in text/sections [:months :header :html])]
      (alchemy/profane :p html))]
   (for [lunar-month calendar/MONTHS
         :let [month-name (get calendar/MONTH-NAMES lunar-month)
               {:keys [title html]} (get-in text/sections [:months (text/->kw month-name)])
               month-start (-> months lunar-month first :date)
               month-start-day
               (when month-start
                 (->> days
                      (filter
                       (fn [{:keys [dawn]}]
                         (calendar/is-before dawn month-start)))
                      last
                      :dawn))]]
     [:section>article
      [:hgroup
       [:h3 (str title "'s Moon")]
       (if month-start
         [:p
          [:p
           [:span (.toLocaleString month-start-day)]
           [:span (str " ; New Moon occurs at " (.toLocaleString month-start))]]]
         [:p "Does not occur this year."])]
      (when html
        (alchemy/profane :p html))])])
