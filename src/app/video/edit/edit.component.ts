import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import IClip from "../../models/clip.model";
import { ClipService } from "../../services/clip.service";
import { ModalService } from "../../services/modal.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.css"]
})
export class EditComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  public activeClip?: IClip | null;

  @Output()
  public update = new EventEmitter();

  inSubmission = false;
  showAlert = false;
  alertColor = "blue";
  alertMsg = "Please wait! Updating clip.";

  clipID = new FormControl("");
  title = new FormControl("", [
    Validators.required,
    Validators.minLength(3)
  ]);
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  });

  constructor(
    private modal: ModalService,
    private clipService: ClipService
  ) {
  }

  ngOnInit(): void {
    this.modal.register("editClip");
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return;
    }

    this.inSubmission = false;
    this.showAlert = false;
    this.clipID.setValue(this.activeClip.docID);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy(): void {
    this.modal.unregister("editClip");
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }

    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = "blue";
    this.alertMsg = "Please wait! Updating clip.";

    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = "red";
      this.alertMsg = "Something went wrong. Try again later";
      return;
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);

    this.inSubmission = false;
    this.alertColor = "green";
    this.alertMsg = "Success!";
  }
}
