(ns witch-clock.templates 
  (:require
   [witch-clock.alchemy :refer [refresh]]
   [witch-clock.templates.geo :as geo]
   [witch-clock.text :as text]))

(defn title
  ([header]
   [:section>hgroup.has-text-centered>h1.title#title header])
  ([header subtitle]
   [:section>hgroup.has-text-centered
    [:h1.title#title header]
    [:p.subtitle#subtitle subtitle]]))

(defn swap-title!
  ([] (refresh :title text/title))
  ([s] (refresh :title s
        )))

(defn swap-subtitle!
  ([] (refresh :subtitle text/subtitle))
  ([s] (refresh :subtitle s)))

(defn heading [s]
  [:section
   [:h2 s]
   [:hr]])

(defn ask-for-geo [-geo]
  [:section
   (if (nil? @-geo)
     (geo/ask-for-geo-form -geo :remember-id geo/save-geo-id)
     [(geo/reset-geo-form geo/geo-reset-id -geo)
      (geo/forget-geo-form geo/geo-forget-id -geo)])
   (geo/custom-geo-form -geo :remember-id geo/save-custom-geo-id)])

(defn container []
  [:main.container
   (title text/title
          text/subtitle)
   [:hr]
   [:div#clock]
   [:div#geo]
   [:div#holidays]
   [:div#about]])
