# 911 Calls avec ElasticSearch

## Import du jeu de données

Pour importer le jeu de données, complétez le script `import.js` (ici aussi, cherchez le `TODO` dans le code :wink:).

Exécutez-le ensuite :

```bash
npm install
node import.js
```

Vérifiez que les données ont été importées correctement grâce au shell (le nombre total de documents doit être `153194`) :

```
GET <nom de votre index>/_count
```

## Requêtes

### Nombre d'appels autour de Landscale dans un rayon de 500 mètres

```
GET 911/_search?size=0
{
    "query": {
        "bool" : {
            "must" : {
                "match_all" : {}
            },
            "filter" : {
                "geo_distance" : {
                    "distance" : "500m",
                    "coordinates" : {
                        "lon" : -75.283783,
                        "lat" :  40.241493
                    }
                }
            }
        }
    }
}

# Résultat
"hits": {
    "total": 717,
    "max_score": 0,
    "hits": []
}
```

### Nombre d'appels par catégorie

```
GET 911/_search?size=0
{
  "aggs" :{
    "total_count" : {
      "global" : {}
    },
    "EMS" : {
      "filter" : {
        "regexp":{
            "category" : "ems"
        }
      } 
    },
    "Fire" : {
      "filter" : {
        "regexp":{
            "category" : "fire"
        }
      } 
    },
    "Traffic" : {
    "filter" : {
       "regexp":{
           "category" : "traffic"
        }
      } 
    }
  }
}

# Résultat
"aggregations": {
    "total_count": {
      "doc_count": 153194
    },
    "Traffic": {
      "doc_count": 54549
    },
    "Fire": {
      "doc_count": 23056
    },
    "EMS": {
      "doc_count": 75589
    }
}
```


### Les trois mois ayant comptabilisés le plus d'appel

```

# Résultat

```

### Top 3 des villes avec le plus d'appels pour overdose

```

#Résultat

```

## Kibana

Dans Kibana, créez un dashboard qui permet de visualiser :

* Une carte de l'ensemble des appels
* Un histogramme des appels répartis par catégories
* Un Pie chart réparti par bimestre, par catégories et par canton (township)

Pour nous permettre d'évaluer votre travail, ajoutez une capture d'écran du dashboard dans ce répertoire [images](images).

### Timelion
Timelion est un outil de visualisation des timeseries accessible via Kibana à l'aide du bouton : ![](images/timelion.png)

Réalisez le diagramme suivant :
![](images/timelion-chart.png)

Envoyer la réponse sous la forme de la requête Timelion ci-dessous:  

```
TODO : ajouter la requête Timelion ici
```
