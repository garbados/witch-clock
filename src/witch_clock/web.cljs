(ns witch-clock.web 
  (:require
   [clojure.string :as string]
   [shadow.cljs.modern :refer [defclass]]
   [witch-clock.alchemy :refer [alchemize] :as alchemy]
   [witch-clock.db :as db]
   [witch-clock.templates :as templates]))

(def -locations (atom {}))

(defn refresh [] (println "TODO"))

(defn main-view [node]
  (.appendChild node (alchemize templates/container))
  (.then (js/Promise.resolve (db/setup-db -locations))
         #(do (add-watch -locations :refresh refresh)
              (refresh))))

(defclass MainComponent
  (extends js/HTMLElement)
  (constructor [this] (super))
  Object
  (connectedCallback [this] (main-view this)))

(def components
  {:main-component MainComponent})

(def already-defined? "has already been defined as a custom element")
(defn start-app []
  (try
    (doseq [[component-kw component] components]
      (js/customElements.define (name component-kw) component))
    (catch js/Object e
      ;; redefining custom elements is impossible
      ;; so if webcomponents complains about dev trying to do so, reload
      ;; but otherwise, just print the error
      (if (string/ends-with? (ex-message e) already-defined?)
        (js/window.location.reload)
        (js/console.log e)))))
