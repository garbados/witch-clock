(ns witch-clock.templates 
  (:require
   [witch-clock.alchemy :refer [refresh]]
   [witch-clock.templates.geo :as geo]
   [witch-clock.text :as text]))

(defn title
  ([header]
   [:hgroup.has-text-centered>h1.title#title header])
  ([header subtitle]
   [:hgroup.has-text-centered
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
  [:section.section>div.box#geo-forms
   (geo/ask-for-geo-form -geo :remember-id geo/save-geo-id)
   #_(geo/reset-geo-form geo/geo-reset-id -geo)
   #_(geo/forget-geo-form geo/geo-forget-id -geo)
   #_(geo/custom-geo-form 0 0 :remember-id geo/save-custom-geo-id -geo)])

(defn container [-geo]
  [:section.section>main.container
   (title text/title
          text/subtitle)
   [:hr]
   (ask-for-geo -geo)])