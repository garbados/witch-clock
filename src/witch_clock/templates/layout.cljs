(ns witch-clock.templates.layout
  (:require
   [witch-clock.templates.about :as about]
   [witch-clock.text :as text]))

(defn container []
  [:main.container
   [:section>hgroup.has-text-centered
    [:h2#title text/title]
    [:p#subtitle text/subtitle]]
   [:hr]
   [:div#clock]
   [:div#geo]
   [:div#intro
    (about/calendar-intro)]
   [:div#seasons]
   [:div#months]
   [:div#holidays]
   [:div#outro
    (about/calendar-outro)]])
