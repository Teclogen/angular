/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ReferencesRegistry} from '../../../ngtsc/annotations';
import {Reference, ResolvedReference} from '../../../ngtsc/imports';
import {Declaration, ReflectionHost} from '../../../ngtsc/reflection';
import {hasNameIdentifier} from '../utils';

/**
 * This is a place for DecoratorHandlers to register references that they
 * find in their analysis of the code.
 *
 * This registry is used to ensure that these references are publicly exported
 * from libraries that are compiled by ngcc.
 */
export class NgccReferencesRegistry implements ReferencesRegistry {
  private map = new Map<ts.Identifier, Declaration>();

  constructor(private host: ReflectionHost) {}

  /**
   * Register one or more references in the registry.
   * Only `ResolveReference` references are stored. Other types are ignored.
   * @param references A collection of references to register.
   */
  add(source: ts.Declaration, ...references: Reference<ts.Declaration>[]): void {
    references.forEach(ref => {
      // Only store resolved references. We are not interested in literals.
      if (ref instanceof ResolvedReference && hasNameIdentifier(ref.node)) {
        const declaration = this.host.getDeclarationOfIdentifier(ref.node.name);
        if (declaration && hasNameIdentifier(declaration.node)) {
          this.map.set(declaration.node.name, declaration);
        }
      }
    });
  }

  /**
   * Create and return a mapping for the registered resolved references.
   * @returns A map of reference identifiers to reference declarations.
   */
  getDeclarationMap(): Map<ts.Identifier, Declaration> { return this.map; }
}
