"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const FavoriteDoctor = require("./schema/FavoriteDoctor");
const FavoriteCompanion = require("./schema/FavoriteCompanion");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        if (!req.body.name || !req.body.seasons) {
            res.status(500).send({message: "name and seasons are required"})
            return
        }
        Doctor.create(req.body)
            .save()
            .then(doctor =>  {
                res.status(201).send(doctor);
            })
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        let fav_id = []
        FavoriteDoctor.find({})
            .then(allDoctors => {
                for (let doctor of allDoctors) {
                    fav_id.push(doctor.doctor)
                }
                Doctor.find({
                    _id: { $in: fav_id }
                })
                    .then(doctors => {
                        res.status(200).send(doctors);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        if (!req.body.doctor_id) {
            res.status(500).send({message: "id is required"})
            return
        }
        Doctor.find({
            _id: req.body.doctor_id
        })
            .then(doctor => {
                FavoriteDoctor.find({
                    doctor: req.body.doctor_id 
                })
                    .then(doctorExists => {
                        if (doctorExists.length == 0) {
                            FavoriteDoctor.create(req.body.doctor_id)
                            .save()
                            .then(favDoctor => {
                                Doctor.find({
                                    _id: favDoctor.doctor
                                })
                                    .then(doctor => {
                                        res.status(201).send(doctor[0]);
                                        return
                                    })
                            })
                        }
                        else {
                            res.status(500).send({ message: "Doctor is already favorited" })
                            return
                        }
                    })

            })
            .catch(err => {
                res.status(500).send({ message: "Doctor not found" });
            });
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.find({
            _id: req.params.id
        })
            .then(data => {
                res.status(200).send(data[0]);
            })
            .catch(err => {
                res.status(404).send({ message: "Doctor not found" });
            });
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        Doctor.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )
            .then(doctor => {
                res.status(200).send(doctor);
            })
            .catch(err => {
                res.status(404).send({
                    message: `some other error`,
                    err: err
                });
            });

    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findOneAndDelete(
            { _id: req.params.id }
        )
        .then(doctor => {
            if (doctor) {
                res.status(200).send(null)
            }
            else {
                res.status(404).send({
                    message: "doctor not found"
                })
            }
        })
        .catch(err => {
            res.status(404).send({
                message: `some other error`,
                err: err
            });
        });
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Companion.find({
            doctors: req.params.id
        })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send({ message: "Doctor not found" });
            });
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Companion.find({
            doctors: req.params.id
        })
            .then(data => {
                for (const companion of data) {
                    if (!companion.alive) {
                        res.status(200).send(false);
                        return
                    }
                }
                res.status(200).send(true);
            })
            .catch(err => {
                res.status(404).send({ message: "Doctor not found" });
            });
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        FavoriteDoctor.findOneAndDelete(
            { doctor: req.params.doctor_id }
        )
        .then(doctor => {
            if (doctor) {
                res.status(200).send(null)
            }
            else {
                res.status(404).send({
                    message: "doctor not found"
                })
            }
        })
        .catch(err => {
            res.status(404).send({
                message: `some other error`,
                err: err
            });
        });
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        if (!req.body.name || !req.body.character || !req.body.doctors || !req.body.seasons || !req.body.alive) {
            res.status(500).send({message: "name, characer, doctors, seasons, and alive are required"})
            return
        }
        Companion.create(req.body)
            .save()
            .then(companion =>  {
                res.status(201).send(companion);
            })
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({})
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].doctors.length == 1) {
                        data.splice(i, 1)
                        i -= 1
                    }
                }
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send({ message: "Companion not found" });
            });
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        let fav_id = []
        FavoriteCompanion.find({})
            .then(allCompanions => {
                for (let companion of allCompanions) {
                    fav_id.push(companion.companion)
                }
                Companion.find({
                    _id: { $in: fav_id }
                })
                    .then(companions => {
                        res.status(200).send(companions);
                    })
                    .catch(err => {
                        res.status(500).send(err);
                    });
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        if (!req.body.companion_id) {
            res.status(500).send({message: "id is required"})
            return
        }
        Companion.find({
            _id: req.body.companion_id
        })
            .then(companion => {
                FavoriteCompanion.find({
                    companion: req.body.companion_id 
                })
                    .then(companionExists => {
                        if (companionExists.length == 0) {
                            FavoriteCompanion.create(req.body.companion_id)
                            .save()
                            .then(favCompanion => {
                                Companion.find({
                                    _id: favCompanion.companion
                                })
                                    .then(companion => {
                                        res.status(201).send(companion[0]);
                                        return
                                    })
                            })
                        }
                        else {
                            res.status(500).send({ message: "Companion is already favorited" })
                            return
                        }
                    })

            })
            .catch(err => {
                res.status(500).send({ message: "Companion not found" });
            });
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.find({
            _id: req.params.id
        })
            .then(data => {
                res.status(200).send(data[0]);
            })
            .catch(err => {
                res.status(404).send({ message: "Companion not found" });
            });
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )
            .then(companion => {
                res.status(200).send(companion);
            })
            .catch(err => {
                res.status(404).send({
                    message: `some other error`,
                    err: err
                });
            });
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findOneAndDelete(
            { _id: req.params.id }
        )
        .then(companion => {
            if (companion) {
                res.status(200).send(null)
            }
            else {
                res.status(404).send({
                    message: "companion not found"
                })
            }
        })
        .catch(err => {
            res.status(404).send({
                message: `some other error`,
                err: err
            });
        });
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.find({
            _id: req.params.id
        })
            .then(data => {
                Doctor.find({
                    _id: data[0].doctors
                })
                    .then(doctors => {
                        res.status(200).send(doctors);
                    })
                    .catch(err => {
                        res.status(404).send({ message: "This companion did not have any doctors" });
                    });
            })
            .catch(err => {
                res.status(404).send({ message: "Companion not found" });
            });
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.find({
            _id: req.params.id
        })
            .then(data => {
                Companion.find({
                    seasons: { $in: data[0].seasons }
                })
                    .then(friends => {
                        for (let i = 0; i < friends.length; i++) {
                            if (friends[i]._id == req.params.id) {
                                friends.splice(i, 1)
                                i -= 1
                            }
                        }
                        res.status(200).send(friends);
                    })
                    .catch(err => {
                        res.status(404).send({ message: "This companion did not have any doctors" });
                    });
            })
            .catch(err => {
                res.status(404).send({ message: "Companion not found" });
            });
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        FavoriteCompanion.findOneAndDelete(
            { companion: req.params.companion_id }
        )
        .then(companion => {
            if (companion) {
                res.status(200).send(null)
            }
            else {
                res.status(404).send({
                    message: "companion not found"
                })
            }
        })
        .catch(err => {
            res.status(404).send({
                message: `some other error`,
                err: err
            });
        });
    });

module.exports = router;