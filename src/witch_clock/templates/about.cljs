(ns witch-clock.templates.about 
  (:require
   [witch-clock.alchemy :as alchemy]
   [witch-clock.text :as text]))

(defn calendar-intro []
  (for [{:keys [title html]} (get-in text/sections [:intro :main])]
    [:section
     [:hgroup>h1 title]
     [:article
      (when html
        (alchemy/profane :p html))]]))

(defn calendar-outro []
  (for [section-name [:qa :changelog]]
    [:section
     [:hgroup
      [:h2 (get-in text/sections [section-name :header :title])]
      (when-let [html (get-in text/sections [section-name :header :html])]
        (alchemy/profane :p html))]
     (for [{:keys [title html]} (get-in text/sections [section-name :main])]
       [:section>article
        [:h3 title]
        (when html
          (alchemy/profane :p html))])]))
