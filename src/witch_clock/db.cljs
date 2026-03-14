(ns witch-clock.db
  (:require
   ["pouchdb" :as pouchdb]
   [clojure.edn :as edn]))

(defn init-db
  ([name]
   (new pouchdb name))
  ([name opts]
   (new pouchdb name opts)))

(def db (init-db "witch-clock"))
(def edn-prop :-edn)

(defn destroy-db []
  (.destroy db))

(defn unmarshal-doc [doc]
  (let [{edn edn-prop
         id_ :_id} (js->clj doc :keywordize-keys true)]
    (merge {:_id id_} (edn/read-string edn))))

(defn marshal-doc [value & {:keys [id to-index]
                            :or {id (random-uuid)
                                 to-index []}}]
  (clj->js
   (merge {:_id (str id)}
          (select-keys value to-index)
          {edn-prop (pr-str value)})))

(defn update-rev [old-doc new-doc]
  (set! (.-_rev new-doc) (.-_rev old-doc)))

(defn get-doc [id]
  (.get db id))

(defn put-doc [doc]
  (.put db doc))

(defn save-doc! [thing & args]
  (put-doc (apply marshal-doc thing args)))

(defn upsert-doc! [thing & args]
  (let [doc (apply marshal-doc thing args)
        upsert! #(do (update-rev % doc)
                     (put-doc doc))]
    (.catch
     (put-doc doc)
     #(if (= 409 (.-status %))
        (.then (get-doc (.-_id doc)) upsert!)
        (throw %)))))

(defn delete-id! [id]
  (.then (get-doc id)
         #(.remove db %)))

(defn snag-edn [id]
  (.then (get-doc id) unmarshal-doc))

(defn normalize-results [results docs?]
  (vec
   (for [js-row (.-rows results)
         :let [js-doc (.-doc js-row)]]
     (if docs?
       (unmarshal-doc js-doc)
       (.-id js-row)))))

(defn list-type [prefix & {:keys [docs?]
                           :or {docs? true}}]
  (let [opts (clj->js {:include_docs docs?
                       :startkey (str prefix "/")
                       :endkey (str prefix "/\uffff")})]
    (.then (.allDocs db opts) #(normalize-results % docs?))))

(defn setup-db [-locations]
  #_(.then
     (js/Promise.all
      (clj->js
       []))
     (fn [[characters stuff]]
       (let [changes-feed (.changes db (clj->js {:since "now" :live true :include_docs true}))]
         (.on changes-feed "change"
              (fn [change]
                (let [doc (unmarshal-doc (.-doc change))]
                  (cond
                    (string/starts-with? (:_id doc) character-prefix)
                    (if (true? (-> change .-doc .-_deleted))
                      (swap! -characters dissoc (:_id doc))
                      (swap! -characters assoc (:_id doc) doc))
                    (string/starts-with? (:_id doc) stuff-prefix)
                    (if (true? (-> change .-doc .-_deleted))
                      (swap! -stuff dissoc (:_id doc))
                      (swap! -stuff assoc (:_id doc) doc)))))))
       (reset! -characters (zipmap (map :_id characters) (map c/hydrate-character characters)))
       (reset! -stuff (zipmap (map :_id stuff) stuff))
       (println "[DB OK]"))))