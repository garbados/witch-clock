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
       (if (< (first time) 10)
         ["Daylight hours are"
          (subs (str (/ day-hour-ms GREG-HOUR-MS)) 0 4)
          "Gregorian hours long."]
         ["Nighttime hours are"
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

(defn current-holidays [{:keys [nth-cycle] :as witchy-year}]
  (let [holidays (calendar/get-holidays witchy-year)]
    [:section
     [:h1.title (str "Holidays for Cycle " nth-cycle)]
     (for [[holiday dt] holidays
           :let [kw (text/->kw holiday)]]
       [:article>details
        {:name "holidays"}
        [:summary
         [:h3.title (str holiday)]
         [:span.subtitle (.toLocaleString dt)]]
        (alchemy/profane :span (get-in text/sections [:holidays kw :html] ""))])]))

(defn explain-date [date time]
  )