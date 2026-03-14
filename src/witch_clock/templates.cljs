(ns witch-clock.templates 
  (:require
   [witch-clock.alchemy :refer [refresh]]))

(defn title
  ([header]
   [:section>hgroup#title header])
  ([header subtitle]
   [:section>hgroup#title header [:p#subtitle subtitle]]))

(defn swap-title! [s] (refresh "title" s))
(defn swap-subtitle! [s] (refresh "subtitle" s))

(defn heading [s]
  [:section
   [:h2 s]
   [:hr]])

(def remember-geo-check
  [:fieldset
   [:label
    {:for "geo-remember"}
    [:input#geo-remember
     {:type "checkbox" :checked true}]
    "Remember location locally"]])

(def decimal-input-options {:type "text" :inputmode "decimal" })

(defn custom-geo-form [latitude longitude]
  [[:p, "Or, you can enter a custom latitude and longitude."],
   [:input#geo-latitude (assoc decimal-input-options :value latitude)]
   [:input#geo-longitude (assoc decimal-input-options :value longitude)]
   remember-geo-check
   [:input#geo-custom {:type :button :value "OK!"}]
   [:input#where-am-i {:type :button :value "Reset location with GPS"}]])

(def container
  [:main.container
   (title "Calendar of the Witchmothers"
          "A lunisolar calendar.")
   ()])