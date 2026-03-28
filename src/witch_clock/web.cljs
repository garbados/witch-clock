(ns witch-clock.web
  (:require
   [clojure.string :as string]
   [shadow.cljs.modern :refer [defclass]]
   [witch-clock.geo :as geo]
   [witch-clock.alchemy :refer [alchemize] :as alchemy]
   [witch-clock.templates :as templates]))


(defn refresh [] (println "TODO"))
(def -locations (atom {}))
(def -geo (atom nil))

(defn main-view [node]
  (-> (geo/recall-current-position)
      (.then
       (fn [coords] (reset! -geo coords)))
      (.finally
       (fn []
         (.appendChild node (alchemize (templates/container -geo)))
         (add-watch -geo :watch-geo (fn [] (println @-geo)))
         (add-watch -locations :refresh refresh)))))

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
